import { Hyperliquid } from "hyperliquid";
import { Logger } from "../../core/logger";
import { LogLevel } from "../types";

export interface HyperliquidCredentials {
    mainAddress: string;
    walletAddress: string;
    privateKey: string;
}

export class HyperliquidClient {
    private client: Hyperliquid;
    private mainAddress: string;
    private logger: Logger;
    private perpMeta: any;

    constructor(
        credentials: HyperliquidCredentials,
        logLevel: LogLevel = LogLevel.INFO,
        testnet: boolean = false
    ) {
        this.mainAddress = credentials.mainAddress;
        this.client = new Hyperliquid({
            enableWs: true,
            privateKey: credentials.privateKey,
            testnet,
            walletAddress: credentials.walletAddress,
        });
        this.logger = new Logger({
            level: logLevel,
            enableColors: true,
            enableTimestamp: true,
        });

        this.client.connect().catch((error) => {
            this.logger.error("HyperliquidClient", "Failed to login", {
                error,
            });
        });
    }

    public async placeLimitOrderInstantOrCancel(
        ticker: string,
        sz: number,
        limit_px: number,
        is_buy: boolean
    ) {
        return this.placeOrder(ticker, sz, limit_px, is_buy, {
            limit: { tif: "Ioc" },
        });
    }

    public async placeLimitOrderGoodTilCancel(
        ticker: string,
        sz: number,
        limit_px: number,
        is_buy: boolean
    ) {
        return this.placeOrder(ticker, sz, limit_px, is_buy, {
            limit: { tif: "Gtc" },
        });
    }

    public async cancelOrder(ticker: string, orderId: number) {
        return await this.client.exchange.cancelOrder({
            coin: ticker,
            o: orderId,
        });
    }

    public async getAccountBalancesAndPositions() {
        return await this.client.info.perpetuals.getClearinghouseState(
            this.mainAddress
        );
    }

    public async getOpenOrders() {
        return await this.client.info
            .getUserOpenOrders(this.mainAddress)
            .catch((error) => {
                console.error("Error getting user open orders:", error);
            });
    }

    public async marketSellPositions(tickers: string[]) {
        const positions = (await this.getAccountBalancesAndPositions())
            .assetPositions;
        return Promise.all(
            tickers.map((ticker) => this.marketSellPosition(ticker, positions))
        );
    }

    public async marketSellPosition(ticker: string, positions: any) {
        if (!ticker) return;
        if (!positions) {
            const { assetPositions } =
                await this.getAccountBalancesAndPositions();
            positions = assetPositions;
        }
        const match = positions.find(
            (p: any) => p.position.coin === `${ticker.toUpperCase()}-PERP`
        );
        if (!match) return;
        const size = Number(match.position.szi);
        return this.placeMarketOrder(ticker.toUpperCase(), size, false);
    }

    private async loadPerpMeta() {
        if (this.perpMeta) return;
        this.perpMeta = {};
        const universe = (await this.client.info.perpetuals.getMeta()).universe;
        universe.forEach((token) => {
            this.perpMeta[token.name] = token.szDecimals;
        });
    }

    public async placeMarketOrderUSD(
        ticker: string,
        totalprice: number,
        is_buy: boolean
    ) {
        await this.loadPerpMeta();
        const orderbook = await this.client.info.getL2Book(ticker + "-PERP");
        const triggerPx = is_buy
            ? Number(orderbook.levels[1][3].px)
            : Number(orderbook.levels[0][3].px);
        let szDecimals = this.perpMeta[ticker + "-PERP"];
        if (szDecimals === undefined) {
            throw new Error("Can't find szDecimals for " + ticker);
        }
        const sz = Number((totalprice / triggerPx).toFixed(szDecimals));
        const result = await this.placeOrder(ticker, sz, triggerPx, is_buy, {
            limit: { tif: "Ioc" },
        });
        return result;
    }

    public async placeMarketOrder(ticker: string, sz: number, is_buy: boolean) {
        const orderbook = await this.client.info.getL2Book(ticker + "-PERP");
        const triggerPx = is_buy
            ? Number(orderbook.levels[1][3].px)
            : Number(orderbook.levels[0][3].px);
        const result = await this.placeOrder(ticker, sz, triggerPx, is_buy, {
            limit: { tif: "Ioc" },
        });
        return result;
    }

    private async placeOrder(
        ticker: string,
        sz: number,
        limit_px: number,
        is_buy: boolean,
        order_type: object
    ) {
        return this.client.exchange.placeOrder({
            coin: ticker + "-PERP",
            is_buy,
            sz,
            limit_px,
            order_type,
            reduce_only: false,
        });
    }
}

// Example usage:
/*
const hyperliquid = new HyperliquidClient(
    {
        mainAddress: env.HYPERLIQUID_MAIN_ADDRESS,
        walletAddress: env.HYPERLIQUID_WALLET_ADDRESS,
        privateKey: env.HYPERLIQUID_PRIVATE_KEY,
    },
    loglevel
);

*/
