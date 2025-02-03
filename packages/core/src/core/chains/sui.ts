import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
import type { IChain } from "../types";
import type { Signer } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";

const parseAccount = (privateKey: string): Signer => {
    if (privateKey.startsWith("suiprivkey")) {
        return loadFromSecretKey(privateKey);
    }
    return loadFromMnemonics(privateKey);
};

const loadFromSecretKey = (privateKey: string) => {
    const keypairClasses = [Ed25519Keypair, Secp256k1Keypair, Secp256r1Keypair];
    for (const KeypairClass of keypairClasses) {
        try {
            return KeypairClass.fromSecretKey(privateKey);
        } catch { }
    }
    throw new Error("Failed to initialize keypair from secret key");
};

const loadFromMnemonics = (mnemonics: string) => {
    const keypairMethods = [
        { Class: Ed25519Keypair, method: "deriveKeypairFromSeed" },
        { Class: Secp256k1Keypair, method: "deriveKeypair" },
        { Class: Secp256r1Keypair, method: "deriveKeypair" },
    ];
    for (const { Class, method } of keypairMethods) {
        try {
            return (Class as any)[method](mnemonics);
        } catch { }
    }
    throw new Error("Failed to derive keypair from mnemonics");
};

export type SuiNetwork = "mainnet" | "testnet" | "devnet" | "localnet";
export type FaucetNetwork = "testnet" | "devnet" | "localnet";

/**
 * Configuration options for initializing a Sui chain connection
 */
export interface SuiChainConfig {
    /** Private key for signing transactions. Should be managed securely! */
    privateKey: string;
    /** Type of sui network */
    network: SuiNetwork;
}

/**
 * Implementation of the IChain interface for interacting with the Sui L1 blockchain
 *
 * @example
 * ```ts
 * const sui = new SuiChain({
 *   privateKey: process.env.SUI_PRIVATE_KEY,
 *   network: process.env.SUI_NETWORK,
 * });
 * ```
 */
export class SuiChain implements IChain {
    /** Unique identifier for this chain implementation */
    public chainId = "sui";
    /** RPC client instance for connecting to Sui */
    private client: SuiClient;
    /** Type of sui network */
    private network: SuiNetwork;
    /** Account instance for transaction signing */
    private wallet: Signer;

    /**
     * Creates a new SuiChain instance
     * @param config - Configuration options for the Sui connection
     */
    constructor(config: SuiChainConfig) {
        this.client = new SuiClient({
            url: getFullnodeUrl(
                config.network,
            ),
        });
        this.network = config.network,
            this.wallet = parseAccount(config.privateKey)
    }

    public async requestSui(call: unknown): Promise<any> {
        try {
            const { network, recipient } = call as {
                network: FaucetNetwork,
                recipient: string,
            }

            await requestSuiFromFaucetV0({
                host: getFaucetHost(network),
                recipient,
            });

            return {
                message: `Successfully requested SUI to ${recipient} on ${network}`,
            };
        } catch (e) {
            return {
                message: `Failed to request SUI: ${e}`,
            };
        }
    }

    /**
     * Performs a read-only call to a Sui contract
     * @param call - The contract call parameters
     * @returns The result of the contract call
     * @throws Error if the call fails
     */
    public async read(call: any): Promise<any> {
        // TODO
    }

    /**
     * Executes a state-changing transaction on Sui
     * @param call - The transaction parameters
     * @returns The transaction receipt after confirmation
     * @throws Error if the transaction fails
     */
    public async write(call: any): Promise<any> {
        // TODO
    }
}
