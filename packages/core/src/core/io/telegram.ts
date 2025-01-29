import type { JSONSchemaType } from "ajv";
import { Logger } from "../../core/logger";
import { LogLevel } from "../types";
import { env } from "../../core/env";
import { Api, TelegramClient as GramJSClient } from "telegram";
import { StringSession, Session } from "telegram/sessions";

export interface User {
    /** Unique identifier for this user or bot. */
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
}

export type Chat = PrivateChat | GroupChat | ChannelChat;

export interface PrivateChat {
    id: number;
    type: "private";
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface GroupChat {
    id: number;
    type: "group";
    title: string;
    members_count?: number;
}

export interface ChannelChat {
    id: number;
    type: "channel";
    title: string;
    username?: string;
    participants_count?: number;
}

// Updated Message Interface
export interface Message {
    message_id: number;
    from?: Api.User;
    date: number;
    chat: Chat;
    text: string;
}

export interface TelegramCredentials {
    bot_token: string; // For bot login

    // For user login
    api_id: number;
    api_hash: string;
    session?: string | Session;

    /** Unique identifier for this user or bot. */
    id?: number;
    is_bot: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
}

export interface MessageData {
    messageId: number;
    content: string;
    from?: User;
}

export interface SendMessageData {
    chatId: number;
    content: string;
    from?: Api.User;
}

export interface GetMessagesData {
    chatId: number;
    limit?: number;
    offset?: number;
}

export class TelegramClient {
    private client: GramJSClient | undefined;
    private logger: Logger;
    private isInitialized: boolean = false;

    constructor(
        private credentials: TelegramCredentials,
        logLevel: LogLevel = LogLevel.INFO
    ) {
        this.credentials = credentials;
        this.logger = new Logger({
            level: logLevel,
            enableColors: true,
            enableTimestamp: true,
        });
        this.initialize();
    }

    async initialize(): Promise<void> {
        try {
            if (!this.isInitialized) {
                if (this.credentials.is_bot) {
                    this.logger.info("TelegramClient", "Logging in as bot.");
                    await this.botLogin();
                    this.isInitialized = true;
                }
                else {
                    this.logger.info("TelegramClient", "Logging in as user.");
                    await this.userLogin();
                    this.isInitialized = true;
                }
            }
        } catch (error) {
            this.logger.error("TelegramClient", "Failed to initialize", {
                error,
            });
            throw error;
        }
    }

    private async botLogin(): Promise<void> {
        if (!this.credentials.bot_token || !this.credentials.api_id || !this.credentials.api_hash) {
            throw new Error("Bot token, Api ID and Api hash are required for bot login.");
        }
        try {
            this.client = new GramJSClient(
                new StringSession(""),
                this.credentials.api_id as number,
                this.credentials.api_hash as string,
                {
                    connectionRetries: 5,
                })

            await this.client.start({
                botAuthToken: env.TELEGRAM_TOKEN,
            });
            console.log(this.client.session.save());

            this.logger.info("TelegramClient", "Bot user:", {
                client: await this.client.getMe()
            });
            this.logger.info("TelegramClient", "Bot login successful.");
        } catch (error) {
            this.logger.error("TelegramClient", "Failed to login as bot", {
                error,
            });
            throw error;
        }
    }
    private async userLogin(): Promise<void> {
        try {
            if (!this.credentials.bot_token || !this.credentials.api_id || !this.credentials.api_hash) {
                throw new Error("Bot token, Api ID and Api hash are required for bot login.");
            }
            this.client = new GramJSClient(
                new StringSession(this.credentials.session?.toString() || ""),
                this.credentials.api_id as number,
                this.credentials.api_hash as string,
                {
                    connectionRetries: 5,
                }
            );

            await this.client.connect();
            this.logger.info("TelegramClient", "Telegram client connected.");
            console.log("Session String: ", await this.client.session.save())

            this.logger.info("TelegramClient", "User details:", {
                client: this.client.getMe()
            });

            this.logger.info("TelegramClient", "User login successful.");
        } catch (error) {
            this.logger.error("TelegramClient", "Failed to login as user", {
                error,
            });
            throw error;
        }
    }

    public async logout(): Promise<void> {
        try {
            if (this.client) {
                await this.client.destroy();
                this.logger.info("TelegramClient", "Logged out successfully.");
            }
        } catch (error) {
            this.logger.error("TelegramClient", "Failed to log out", {
                error,
            });
            throw error;
        }
    }

    /**
     * Create an output for sending Telegram message
    */
    public createSendMessageOutput() {
        return {
            name: "telegram_send_message",
            handler: async (data: SendMessageData) => {
                return await this.sendMessage(data);
            },
            response: {
                success: "boolean",
                chatId: "number",
                messageId: "number",
            },
        };
    }

    /**
     * Create an output for getting messages from an channel, private chat, group chat, etc
    */
    public createChannelScraper() {
        return {
            name: "telegram_get_messages",
            handler: async (data: GetMessagesData) => {
                return await this.getMessages(data);
            },
            response: {
                success: "boolean",
                messages: "array",
            }
        };
    }

    private async sendMessage(data: SendMessageData): Promise<{ success: boolean, chatId?: number, messageId?: number }> {
        try {
            this.logger.info("TelegramClient.sendMessage", "Would send message", { data });

            if (env.DRY_RUN) {
                return {
                    success: true,
                };
            }

            if (this.client) {
                const result = await this.client.sendMessage(data.chatId, {
                    message: data.content,
                });

                return {
                    success: true,
                    chatId: data.chatId,
                    messageId: result.id,
                };
            }
            else {
                throw new Error("Neither bot nor user client is initialized.");
            }
        } catch (error) {
            this.logger.error("TelegramClient.sendMessage", "Error sending message", { error });
            throw error;
        }
    }

    public async getMessages(data: GetMessagesData): Promise<Message[]> {
        try {
            if (!this.client) {
                throw new Error("Client is not initialized");
            }

            this.logger.info("TelegramClient.getMessages", "Fetching messages", { data });

            // Resolve the correct peer based on chat ID
            const entity = await this.client.getEntity(data.chatId);
            let peer: Api.TypeInputPeer;

            if (entity instanceof Api.Channel) {
                peer = new Api.InputPeerChannel({
                    channelId: entity.id,
                    accessHash: entity.accessHash!
                });
            } else if (entity instanceof Api.Chat) {
                peer = new Api.InputPeerChat({
                    chatId: entity.id
                });
            } else if (entity instanceof Api.User) {
                peer = new Api.InputPeerUser({
                    userId: entity.id,
                    accessHash: entity.accessHash!
                });
            } else {
                throw new Error("Unsupported chat type");
            }

            // Fetch messages with proper pagination
            const result = await this.client.getMessages(peer, {
                limit: data.limit || 100,
                offsetId: data.offset,
                addOffset: data.offset ? 0 : undefined,
            });

            if (!result?.length) return [];

            return result
                .filter((m): m is Api.Message => m instanceof Api.Message)
                .map(message => this.parseMessage(message));
        } catch (error) {
            this.logger.error("TelegramClient.getMessages", "Error getting messages", { error });
            throw error;
        }
    }

    private parseMessage(message: Api.Message): Message {
        const sender = message.sender as Api.User | Api.Channel | undefined;
        const from: Api.User | undefined = sender instanceof Api.User ? sender : undefined;

        const chat = this.parseChat(message.peerId);

        return {
            message_id: message.id,
            from,
            date: message.date.valueOf(),
            chat,
            text: message.text || '',
        };
    }

    private parseChat(peerId: Api.TypePeer): Chat {
        if (peerId instanceof Api.PeerUser) {
            return {
                id: peerId.userId.toJSNumber(),
                type: "private",
                first_name: "Unknown",
            };
        } else if (peerId instanceof Api.PeerChat) {
            return {
                id: peerId.chatId.toJSNumber(),
                type: "group",
                title: "Unknown Group",
            };
        } else if (peerId instanceof Api.PeerChannel) {
            return {
                id: peerId.channelId.toJSNumber(),
                type: "channel",
                title: "Unknown Channel",
            };
        }
        throw new Error("Unknown chat type");
    }

    public async getChatInfo(chatId: number): Promise<Chat> {
        if (!this.client) throw new Error("Client not initialized");

        const entity = await this.client.getEntity(chatId);

        if (entity instanceof Api.Channel) {
            return {
                id: entity.id.toJSNumber(),
                type: "channel",
                title: entity.title,
                username: entity.username,
                participants_count: entity.participantsCount
            };
        } else if (entity instanceof Api.Chat) {
            return {
                id: entity.id.toJSNumber(),
                type: "group",
                title: entity.title,
                members_count: entity.participantsCount
            };
        } else if (entity instanceof Api.User) {
            return {
                id: entity.id.toJSNumber(),
                type: "private",
                first_name: entity.firstName,
                last_name: entity.lastName,
                username: entity.username
            };
        }

        throw new Error("Unknown chat type");
    }
}