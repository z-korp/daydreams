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
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) {
            this.logger.info("TelegramClient", "Already initialized, skipping...");
            return;
        }

        try {
            if (this.credentials.is_bot) {
                this.logger.info("TelegramClient", "Logging in as bot.");
                await this.botLogin();
            } else {
                this.logger.info("TelegramClient", "Logging in as user.");
                await this.userLogin();
            }
            this.isInitialized = true;
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

            const me = await this.client.getMe();
            this.logger.info("TelegramClient", "Bot user:", { client: me });
            
            // Send startup message
            if (env.TELEGRAM_STARTUP_CHAT_ID) {
                await this.sendMessage({
                    chatId: parseInt(env.TELEGRAM_STARTUP_CHAT_ID),
                    content: `🤖 Bot started successfully!\nBot username: @${(me as Api.User).username}\nTime: ${new Date().toLocaleString()}`
                });
            }
            
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
            if (!this.credentials.api_id || !this.credentials.api_hash) {
                throw new Error("API ID and API hash are required for user login.");
            }

            // Try to use session string if provided
            const sessionString = this.credentials.session?.toString();
            if (!sessionString) {
                this.logger.info("TelegramClient", "No session string provided, starting interactive login");
                await this.handleInteractiveLogin();
                return;
            }

            try {
                // Initialize client with session
                this.client = new GramJSClient(
                    new StringSession(sessionString),
                    this.credentials.api_id,
                    this.credentials.api_hash,
                    {
                        connectionRetries: 5,
                    }
                );

                // Try to connect and validate session
                this.logger.info("TelegramClient", "Attempting to connect with existing session...");
                await this.client.connect();
                
                // Verify the session is valid by getting user info
                const me = await this.client.getMe();
                this.logger.info("TelegramClient", "Successfully connected with session", {
                    id: (me as Api.User).id,
                    username: (me as Api.User).username
                });

                // Send startup message
                await this.sendStartupMessage(me as Api.User);
                
            } catch (error) {
                this.logger.warn("TelegramClient", "Session invalid or expired, falling back to interactive login", { error });
                // Create new client for interactive login
                this.client = new GramJSClient(
                    new StringSession(""),
                    this.credentials.api_id,
                    this.credentials.api_hash,
                    {
                        connectionRetries: 5,
                    }
                );
                await this.handleInteractiveLogin();
            }
        } catch (error) {
            this.logger.error("TelegramClient", "Failed to login as user", { error });
            throw error;
        }
    }

    private async handleInteractiveLogin(): Promise<void> {
        const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        try {
            await this.client!.start({
                phoneNumber: async () => {
                    return await new Promise<string>((resolve) => {
                        rl.question('Please enter your phone number: ', (phone: string) => {
                            resolve(phone);
                        });
                    });
                },
                password: async () => {
                    return await new Promise<string>((resolve) => {
                        rl.question('Please enter your 2FA password (if enabled): ', (password: string) => {
                            resolve(password);
                        });
                    });
                },
                phoneCode: async () => {
                    return await new Promise<string>((resolve) => {
                        rl.question('Please enter the code you received: ', (code: string) => {
                            resolve(code);
                        });
                    });
                },
                onError: (err) => {
                    this.logger.error("TelegramClient", "Error during login", { error: err });
                },
            });

            // Save and display the new session string
            const newSessionString = await this.client!.session.save();
            console.log("\n⚠️ SAVE THIS SESSION STRING FOR FUTURE USE:");
            console.log(newSessionString);

            // Get user details and send startup message
            const me = await this.client!.getMe();
            await this.sendStartupMessage(me as Api.User);

        } finally {
            rl.close();
        }
    }

    private async sendStartupMessage(user: Api.User): Promise<void> {
        if (!env.TELEGRAM_STARTUP_CHAT_ID) return;

        try {
            const message = `🤖 User logged in successfully!\n` +
                `User ID: ${user.id}\n` +
                `Username: @${user.username || 'unknown'}\n` +
                `Time: ${new Date().toLocaleString()}`;

            const result = await this.sendMessage({
                chatId: parseInt(env.TELEGRAM_STARTUP_CHAT_ID),
                content: message
            });

            this.logger.info("TelegramClient", "Startup message sent", { result });
        } catch (msgError) {
            this.logger.error("TelegramClient", "Failed to send startup message", { error: msgError });
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
            name: "telegram_channel_scraper",
            handler: async (data: GetMessagesData) => {
                return await this.getMessages(data);
            },
            response: {
                success: "boolean",
                messages: "array",
            }
        };
    }

    /**
     * Create a handler for periodic channel scraping
     */
    public createPeriodicChannelScraper(channels: number[]) {
        return {
            name: "consciousness_channel_scrape",
            handler: async (data: GetMessagesData) => {
                const allMessages: Message[] = [];
                
                for (const chatId of channels) {
                    try {
                        const messages = await this.getMessages({
                            chatId,
                            limit: data.limit || 10,
                        });
                        allMessages.push(...messages);
                    } catch (error) {
                        this.logger.error("TelegramClient.periodicScrape", 
                            `Error scraping channel ${chatId}`, { error });
                    }
                }
                
                return {
                    success: true,
                    messages: allMessages,
                };
            },
            response: {
                success: "boolean",
                messages: "array",
            }
        };
    }

    private async sendMessage(data: SendMessageData): Promise<{ success: boolean, chatId?: number, messageId?: number }> {
        try {
            this.logger.info("TelegramClient.sendMessage", "Sending message", { 
                chatId: data.chatId,
                contentLength: data.content.length 
            });

            if (!this.client) {
                throw new Error("Client not initialized");
            }

            if (env.DRY_RUN) {
                this.logger.info("TelegramClient.sendMessage", "DRY_RUN: Would send message", { data });
                return { success: true };
            }

            const result = await this.client.sendMessage(data.chatId, {
                message: data.content,
            });

            this.logger.info("TelegramClient.sendMessage", "Message sent successfully", {
                messageId: result.id,
                chatId: data.chatId
            });

            return {
                success: true,
                chatId: data.chatId,
                messageId: result.id,
            };
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