import {
    action,
    type ActionCall,
    type Agent,
    context,
    createDreams,
    extension,
    render,
    validateEnv,
    LogLevel,
} from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { anthropic } from "@ai-sdk/anthropic";
import { string, z } from "zod";
import { StarknetChain } from "@daydreamsai/defai";

/**
 * NOTE: To resolve the '@daydreamsai/defai' module error:
 * 1. First make sure you have the package installed by running:
 *    pnpm add @daydreamsai/defai
 *
 * 2. If developing within the monorepo, you may need to add it to your workspace:
 *    In package.json, add:
 *    "dependencies": {
 *      "@daydreamsai/defai": "workspace:*"
 *    }
 */

// Validate environment variables
const env = validateEnv(
    z.object({
        ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
        STARKNET_RPC_URL: z.string().min(1, "STARKNET_RPC_URL is required"),
        STARKNET_ADDRESS: z.string().min(1, "STARKNET_ADDRESS is required"),
        STARKNET_PRIVATE_KEY: z.string().min(1, "STARKNET_PRIVATE_KEY is required"),
    })
);

// Initialize Starknet chain connection
const starknet = new StarknetChain({
    rpcUrl: env.STARKNET_RPC_URL,
    address: env.STARKNET_ADDRESS,
    privateKey: env.STARKNET_PRIVATE_KEY
});

// Game contract addresses
const GAME_CONTRACT_ADDRESS = "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4"; // Replace with actual contract address

// Define an interface for the Loot Survivor state
interface LootSurvivorState {
    // Game state
    adventurerId: string;
    adventurerHealth: string;
    adventurerMaxHealth: string;
    level: string;
    xp: string;
    gold: string;
    statUpgrades: string;

    // Battle state
    inBattle: string;
    lastAction: string;
    lastDamageDealt: string;
    lastDamageTaken: string;
    lastCritical: string;
    battleActionCount: string;

    // Stats
    strength: string;
    dexterity: string;
    vitality: string;
    intelligence: string;
    wisdom: string;
    charisma: string;
    luck: string;

    // Equipment
    weapon: string;
    chest: string;
    head: string;
    waist: string;
    foot: string;
    hand: string;
    neck: string;
    ring: string;

    // Beast info
    currentBeast: string;
    beastHealth: string;
    beastMaxHealth: string;
    beastLevel: string;
    beastTier: string;
    beastType: string;
    beastSpecial1: string;
    beastSpecial2: string;
    beastSpecial3: string;

    // Bag/Inventory
    bagItems: string[];

    // Market
    marketItems: string[];
}

// Helper to convert hex values to decimal
function hexToDec(hex: string): string {
    // Remove '0x' prefix if present
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    return parseInt(cleanHex, 16).toString();
}

// Function to parse adventurer data from Starknet response
function parseAdventurerData(adventurerResult: any): {
    health: string;
    xp: string;
    gold: string;
    beast_health: string;
    stat_upgrades_available: string;
    stats: {
        strength: string;
        dexterity: string;
        vitality: string;
        intelligence: string;
        wisdom: string;
        charisma: string;
        luck: string;
    };
    equipment: {
        weapon: { id: string, xp: string };
        chest: { id: string, xp: string };
        head: { id: string, xp: string };
        waist: { id: string, xp: string };
        foot: { id: string, xp: string };
        hand: { id: string, xp: string };
        neck: { id: string, xp: string };
        ring: { id: string, xp: string };
    };
    battle_action_count: string;
} {
    if (!adventurerResult || !Array.isArray(adventurerResult)) {
        return {
            health: "0",
            xp: "0",
            gold: "0",
            beast_health: "0",
            stat_upgrades_available: "0",
            stats: {
                strength: "0",
                dexterity: "0",
                vitality: "0",
                intelligence: "0",
                wisdom: "0",
                charisma: "0",
                luck: "0"
            },
            equipment: {
                weapon: { id: "0", xp: "0" },
                chest: { id: "0", xp: "0" },
                head: { id: "0", xp: "0" },
                waist: { id: "0", xp: "0" },
                foot: { id: "0", xp: "0" },
                hand: { id: "0", xp: "0" },
                neck: { id: "0", xp: "0" },
                ring: { id: "0", xp: "0" }
            },
            battle_action_count: "0"
        };
    }

    try {
        // Based on the Adventurer struct in the contract
        const health = hexToDec(adventurerResult[0]);
        const xp = hexToDec(adventurerResult[1]);
        const gold = hexToDec(adventurerResult[2]);
        const beast_health = hexToDec(adventurerResult[3]);
        const stat_upgrades_available = hexToDec(adventurerResult[4]);

        // Stats struct (fields 5-11)
        const stats = {
            strength: hexToDec(adventurerResult[5]),
            dexterity: hexToDec(adventurerResult[6]),
            vitality: hexToDec(adventurerResult[7]),
            intelligence: hexToDec(adventurerResult[8]),
            wisdom: hexToDec(adventurerResult[9]),
            charisma: hexToDec(adventurerResult[10]),
            luck: hexToDec(adventurerResult[11])
        };

        // Equipment struct - each item has an ID and XP
        // The structure follows the Equipment struct in the contract
        const equipment = {
            weapon: { id: hexToDec(adventurerResult[12]), xp: hexToDec(adventurerResult[13]) },
            chest: { id: hexToDec(adventurerResult[14]), xp: hexToDec(adventurerResult[15]) },
            head: { id: hexToDec(adventurerResult[16]), xp: hexToDec(adventurerResult[17]) },
            waist: { id: hexToDec(adventurerResult[18]), xp: hexToDec(adventurerResult[19]) },
            foot: { id: hexToDec(adventurerResult[20]), xp: hexToDec(adventurerResult[21]) },
            hand: { id: hexToDec(adventurerResult[22]), xp: hexToDec(adventurerResult[23]) },
            neck: { id: hexToDec(adventurerResult[24]), xp: hexToDec(adventurerResult[25]) },
            ring: { id: hexToDec(adventurerResult[26]), xp: hexToDec(adventurerResult[27]) }
        };

        // Battle action count
        const battle_action_count = hexToDec(adventurerResult[28]);

        return {
            health,
            xp,
            gold,
            beast_health,
            stat_upgrades_available,
            stats,
            equipment,
            battle_action_count
        };
    } catch (error) {
        console.error(`[ERROR] Failed to parse adventurer data: ${error}`);
        return {
            health: "0",
            xp: "0",
            gold: "0",
            beast_health: "0",
            stat_upgrades_available: "0",
            stats: {
                strength: "0",
                dexterity: "0",
                vitality: "0",
                intelligence: "0",
                wisdom: "0",
                charisma: "0",
                luck: "0"
            },
            equipment: {
                weapon: { id: "0", xp: "0" },
                chest: { id: "0", xp: "0" },
                head: { id: "0", xp: "0" },
                waist: { id: "0", xp: "0" },
                foot: { id: "0", xp: "0" },
                hand: { id: "0", xp: "0" },
                neck: { id: "0", xp: "0" },
                ring: { id: "0", xp: "0" }
            },
            battle_action_count: "0"
        };
    }
}

// Function to parse beast data from Starknet response
function parseBeastData(beastResult: any): {
    id: string;
    starting_health: string;
    combat_spec: {
        tier: string;
        item_type: string;
        level: string;
        specials: {
            special1: string;
            special2: string;
            special3: string;
        }
    }
} {
    if (!beastResult || !Array.isArray(beastResult)) {
        return {
            id: "0",
            starting_health: "0",
            combat_spec: {
                tier: "0",
                item_type: "0",
                level: "0",
                specials: {
                    special1: "0",
                    special2: "0",
                    special3: "0"
                }
            }
        };
    }

    try {
        // Beast struct has:
        // 1. id (u8)
        // 2. starting_health (u16)
        // 3. combat_spec (CombatSpec)
        //    - tier (Tier)
        //    - item_type (Type)
        //    - level (u16)
        //    - specials (SpecialPowers)
        //      - special1, special2, special3 (u8)

        const id = hexToDec(beastResult[0]);
        const starting_health = hexToDec(beastResult[1]);

        // CombatSpec structure
        const tier = hexToDec(beastResult[2]);
        const item_type = hexToDec(beastResult[3]);
        const level = hexToDec(beastResult[4]);

        // Specials sub-structure
        const special1 = hexToDec(beastResult[5]);
        const special2 = hexToDec(beastResult[6]);
        const special3 = hexToDec(beastResult[7]);

        return {
            id,
            starting_health,
            combat_spec: {
                tier,
                item_type,
                level,
                specials: {
                    special1,
                    special2,
                    special3
                }
            }
        };
    } catch (error) {
        console.error(`[ERROR] Failed to parse beast data: ${error}`);
        return {
            id: "0",
            starting_health: "0",
            combat_spec: {
                tier: "0",
                item_type: "0",
                level: "0",
                specials: {
                    special1: "0",
                    special2: "0",
                    special3: "0"
                }
            }
        };
    }
}

// Function to map beast type to readable string
function getBeastType(typeId: string): string {
    const types: { [key: string]: string } = {
        "0": "None",
        "1": "Magic/Cloth",
        "2": "Blade/Hide",
        "3": "Bludgeon/Metal",
        "4": "Necklace",
        "5": "Ring"
    };
    return types[typeId] || `Type ${typeId}`;
}

// Function to map beast tier to readable string
function getBeastTier(tierId: string): string {
    const tiers: { [key: string]: string } = {
        "0": "None",
        "1": "T1",
        "2": "T2",
        "3": "T3",
        "4": "T4",
        "5": "T5"
    };
    return tiers[tierId] || `Tier ${tierId}`;
}

// Function to map beast ID to proper name
function getBeastName(beastId: string): string {
    const beastNames: { [key: string]: string } = {
        "0": "None",
        "1": "Warlock",
        "2": "Typhon",
        "3": "Jiangshi",
        "4": "Anansi",
        "5": "Basilisk",
        "6": "Gorgon",
        "7": "Kitsune",
        "8": "Lich",
        "9": "Chimera",
        "10": "Wendigo",
        "11": "Rakshasa",
        "12": "Werewolf",
        "13": "Banshee",
        "14": "Draugr",
        "15": "Vampire",
        "16": "Goblin",
        "17": "Ghoul",
        "18": "Wraith",
        "19": "Sprite",
        "20": "Kappa",
        "21": "Fairy",
        "22": "Leprechaun",
        "23": "Kelpie",
        "24": "Pixie",
        "25": "Gnome",
        "26": "Griffin",
        "27": "Manticore",
        "28": "Phoenix",
        "29": "Dragon",
        "30": "Minotaur",
        "31": "Qilin",
        "32": "Ammit",
        "33": "Nue",
        "34": "Skinwalker",
        "35": "Chupacabra",
        "36": "Weretiger",
        "37": "Wyvern",
        "38": "Roc",
        "39": "Harpy",
        "40": "Pegasus",
        "41": "Hippogriff",
        "42": "Fenrir",
        "43": "Jaguar",
        "44": "Satori",
        "45": "Dire Wolf",
        "46": "Bear",
        "47": "Wolf",
        "48": "Mantis",
        "49": "Spider",
        "50": "Rat",
        "51": "Kraken",
        "52": "Colossus",
        "53": "Balrog",
        "54": "Leviathan",
        "55": "Tarrasque",
        "56": "Titan",
        "57": "Nephilim",
        "58": "Behemoth",
        "59": "Hydra",
        "60": "Juggernaut",
        "61": "Oni",
        "62": "Jotunn",
        "63": "Ettin",
        "64": "Cyclops",
        "65": "Giant",
        "66": "Nemean Lion",
        "67": "Berserker",
        "68": "Yeti",
        "69": "Golem",
        "70": "Ent",
        "71": "Troll",
        "72": "Bigfoot",
        "73": "Ogre",
        "74": "Orc",
        "75": "Skeleton"
    };
    return beastNames[beastId] || `Beast #${beastId}`;
}

async function getAdventurerState(contractAddress: string, adventurerId: string): Promise<LootSurvivorState | null> {
    try {
        console.log(`[STARKNET] Calling get_adventurer function for ID: ${adventurerId}`);

        const adventurerResult = await starknet.read({
            contractAddress,
            entrypoint: "get_adventurer",
            calldata: [adventurerId]
        });

        console.log(`[STARKNET] Raw adventurer result:`, JSON.stringify(adventurerResult));

        if (!adventurerResult || adventurerResult.message) {
            console.error(`[ERROR] Failed to get adventurer: ${adventurerResult?.message || 'Unknown error'}`);
            return null;
        }

        // Parse adventurer data
        const adventurerData = parseAdventurerData(adventurerResult.result || adventurerResult);

        // Calculate level
        const xpNumber = parseInt(adventurerData.xp);
        const level = Math.floor(Math.sqrt(xpNumber / 100)) + 1;

        // Check if in battle
        const inBattle = parseInt(adventurerData.beast_health) > 0;

        // Map item IDs to names
        const getItemName = (item: { id: string, xp: string }): string => {
            if (!item || item.id === "0") return "None";

            // Complete item mapping based on loot/constants/ItemId
            const itemTypes: { [key: number]: string } = {
                0: "None",
                1: "Pendant",
                2: "Necklace",
                3: "Amulet",
                4: "Silver Ring",
                5: "Bronze Ring",
                6: "Platinum Ring",
                7: "Titanium Ring",
                8: "Gold Ring",
                9: "Ghost Wand",
                10: "Grave Wand",
                11: "Bone Wand",
                12: "Wand",
                13: "Grimoire",
                14: "Chronicle",
                15: "Tome",
                16: "Book",
                17: "Divine Robe",
                18: "Silk Robe",
                19: "Linen Robe",
                20: "Robe",
                21: "Shirt",
                22: "Crown",
                23: "Divine Hood",
                24: "Silk Hood",
                25: "Linen Hood",
                26: "Hood",
                27: "Brightsilk Sash",
                28: "Silk Sash",
                29: "Wool Sash",
                30: "Linen Sash",
                31: "Sash",
                32: "Divine Slippers",
                33: "Silk Slippers",
                34: "Wool Shoes",
                35: "Linen Shoes",
                36: "Shoes",
                37: "Divine Gloves",
                38: "Silk Gloves",
                39: "Wool Gloves",
                40: "Linen Gloves",
                41: "Gloves",
                42: "Katana",
                43: "Falchion",
                44: "Scimitar",
                45: "Long Sword",
                46: "Short Sword",
                47: "Demon Husk",
                48: "Dragonskin Armor",
                49: "Studded Leather Armor",
                50: "Hard Leather Armor",
                51: "Leather Armor",
                52: "Demon Crown",
                53: "Dragon's Crown",
                54: "War Cap",
                55: "Leather Cap",
                56: "Cap",
                57: "Demonhide Belt",
                58: "Dragonskin Belt",
                59: "Studded Leather Belt",
                60: "Hard Leather Belt",
                61: "Leather Belt",
                62: "Demonhide Boots",
                63: "Dragonskin Boots",
                64: "Studded Leather Boots",
                65: "Hard Leather Boots",
                66: "Leather Boots",
                67: "Demon's Hands",
                68: "Dragonskin Gloves",
                69: "Studded Leather Gloves",
                70: "Hard Leather Gloves",
                71: "Leather Gloves",
                72: "Warhammer",
                73: "Quarterstaff",
                74: "Maul",
                75: "Mace",
                76: "Club",
                77: "Holy Chestplate",
                78: "Ornate Chestplate",
                79: "Plate Mail",
                80: "Chain Mail",
                81: "Ring Mail",
                82: "Ancient Helm",
                83: "Ornate Helm",
                84: "Great Helm",
                85: "Full Helm",
                86: "Helm",
                87: "Ornate Belt",
                88: "War Belt",
                89: "Plated Belt",
                90: "Mesh Belt",
                91: "Heavy Belt",
                92: "Holy Greaves",
                93: "Ornate Greaves",
                94: "Greaves",
                95: "Chain Boots",
                96: "Heavy Boots",
                97: "Holy Gauntlets",
                98: "Ornate Gauntlets",
                99: "Gauntlets",
                100: "Chain Gloves",
                101: "Heavy Gloves"
            };

            const id = parseInt(item.id);
            return itemTypes[id] || `Item #${id}`;
        };

        // Create state object
        const state: LootSurvivorState = {
            adventurerId,
            adventurerHealth: adventurerData.health,
            adventurerMaxHealth: adventurerData.health, // Same as current health for now
            level: level.toString(),
            xp: adventurerData.xp,
            gold: adventurerData.gold,
            statUpgrades: adventurerData.stat_upgrades_available,

            // Stats
            strength: adventurerData.stats.strength,
            dexterity: adventurerData.stats.dexterity,
            vitality: adventurerData.stats.vitality,
            intelligence: adventurerData.stats.intelligence,
            wisdom: adventurerData.stats.wisdom,
            charisma: adventurerData.stats.charisma,
            luck: adventurerData.stats.luck,

            // Equipment
            weapon: getItemName(adventurerData.equipment.weapon),
            chest: getItemName(adventurerData.equipment.chest),
            head: getItemName(adventurerData.equipment.head),
            waist: getItemName(adventurerData.equipment.waist),
            foot: getItemName(adventurerData.equipment.foot),
            hand: getItemName(adventurerData.equipment.hand),
            neck: getItemName(adventurerData.equipment.neck),
            ring: getItemName(adventurerData.equipment.ring),

            // Beast info
            currentBeast: "None",
            beastHealth: adventurerData.beast_health,
            beastMaxHealth: "0",
            beastLevel: "0",
            beastTier: "0",
            beastType: "0",
            beastSpecial1: "None",
            beastSpecial2: "None",
            beastSpecial3: "None",

            // Battle state
            inBattle: inBattle ? "true" : "false",
            lastAction: "None",
            lastDamageDealt: "0",
            lastDamageTaken: "0",
            lastCritical: "false",
            battleActionCount: adventurerData.battle_action_count,

            // Bag/Inventory
            bagItems: [],

            // Market
            marketItems: []
        };

        // If in battle, get beast details
        if (inBattle) {
            try {
                console.log(`[STARKNET] Calling get_attacking_beast function`);
                const beastResult = await starknet.read({
                    contractAddress: GAME_CONTRACT_ADDRESS,
                    entrypoint: "get_attacking_beast",
                    calldata: [adventurerId]
                });

                console.log(`[STARKNET] Raw beast result:`, JSON.stringify(beastResult));

                if (beastResult && !beastResult.message) {
                    const beastData = parseBeastData(beastResult.result || beastResult);

                    state.currentBeast = getBeastName(beastData.id);
                    state.beastMaxHealth = beastData.starting_health;
                    state.beastLevel = beastData.combat_spec.level;
                    state.beastTier = getBeastTier(beastData.combat_spec.tier);
                    state.beastType = getBeastType(beastData.combat_spec.item_type);
                    state.beastSpecial1 = beastData.combat_spec.specials.special1;
                    state.beastSpecial2 = beastData.combat_spec.specials.special2;
                    state.beastSpecial3 = beastData.combat_spec.specials.special3;
                }
            } catch (beastError) {
                console.log(`[STARKNET] Could not retrieve beast details: ${beastError}`);
            }
        }

        // Try to get bag items
        try {
            console.log(`[STARKNET] Calling get_bag function`);
            const bagResult = await starknet.read({
                contractAddress,
                entrypoint: "get_bag",
                calldata: [adventurerId]
            });

            console.log(`[STARKNET] Raw bag result:`, JSON.stringify(bagResult));

            if (bagResult && !bagResult.message && (bagResult.result || bagResult)) {
                const rawBag = bagResult.result || bagResult;
                state.bagItems = [];

                // The bag in the contract is a struct with 15 items
                // Each item has id and xp fields
                for (let i = 0; i < 15; i++) {
                    // In the array response, items are consecutive
                    // item1.id, item1.xp, item2.id, item2.xp, ...
                    const itemIdIndex = i * 2; // ID at even indices
                    const itemXpIndex = i * 2 + 1; // XP at odd indices

                    if (itemIdIndex < rawBag.length && rawBag[itemIdIndex] !== "0x0") {
                        const itemId = hexToDec(rawBag[itemIdIndex]);
                        if (itemId !== "0") {
                            const itemName = getItemName({ id: itemId, xp: "0" });
                            state.bagItems.push(itemName);
                        }
                    }
                }
            }
        } catch (bagError) {
            console.log(`[STARKNET] Could not retrieve bag items: ${bagError}`);
        }

        return state;
    } catch (error) {
        console.error(`[ERROR] Failed to get adventurer state: ${error}`);
        return null;
    }
}

// Function to print the current game state to console
function printGameState(state: LootSurvivorState) {
    console.log("\n=== GAME STATE ===");
    console.log(`Adventurer: ID ${state.adventurerId} | Health: ${state.adventurerHealth}/${state.adventurerMaxHealth}`);
    console.log(`Level: ${state.level} | XP: ${state.xp} | Gold: ${state.gold}`);
    console.log(`Battle Actions: ${state.battleActionCount}`);

    console.log("\n=== STATS ===");
    console.log(`STR: ${state.strength} | DEX: ${state.dexterity} | VIT: ${state.vitality}`);
    console.log(`INT: ${state.intelligence} | WIS: ${state.wisdom} | CHA: ${state.charisma} | LCK: ${state.luck}`);
    console.log(`Available Upgrades: ${state.statUpgrades}`);

    console.log("\n=== EQUIPMENT ===");
    console.log(`Weapon: ${state.weapon} | Chest: ${state.chest} | Head: ${state.head}`);
    console.log(`Waist: ${state.waist} | Foot: ${state.foot} | Hand: ${state.hand}`);
    console.log(`Neck: ${state.neck} | Ring: ${state.ring}`);

    if (state.inBattle === "true") {
        console.log("\n=== BATTLE ===");
        console.log(`Beast: ${state.currentBeast} (Level ${state.beastLevel})`);
        console.log(`Beast Health: ${state.beastHealth}/${state.beastMaxHealth}`);
        console.log(`Beast Tier: ${state.beastTier} | Type: ${state.beastType}`);
        console.log(`Specials: ${state.beastSpecial1}, ${state.beastSpecial2}, ${state.beastSpecial3}`);
    }

    console.log("\n=== INVENTORY ===");
    console.log(`Bag Items: ${state.bagItems.length > 0 ? state.bagItems.join(", ") : "None"}`);

    console.log("\n=== LAST ACTION ===");
    console.log(`${state.lastAction} | Damage Dealt: ${state.lastDamageDealt} | Damage Taken: ${state.lastDamageTaken}`);
    console.log(`Critical Hit: ${state.lastCritical}`);
    console.log("===================\n");
}

// Helper function to initialize agent memory if it doesn't exist
export function initializeLootSurvivorMemory(ctx: any): LootSurvivorState {
    if (!ctx.agentMemory) {
        ctx.agentMemory = {
            adventurerId: "0",
            adventurerHealth: "0",
            adventurerMaxHealth: "0",
            level: "1",
            xp: "0",
            gold: "0",
            statUpgrades: "0",

            strength: "0",
            dexterity: "0",
            vitality: "0",
            intelligence: "0",
            wisdom: "0",
            charisma: "0",
            luck: "0",

            weapon: "None",
            chest: "None",
            head: "None",
            waist: "None",
            foot: "None",
            hand: "None",
            neck: "None",
            ring: "None",

            currentBeast: "None",
            beastHealth: "0",
            beastMaxHealth: "0",
            beastLevel: "0",
            beastTier: "0",
            beastType: "0",
            beastSpecial1: "None",
            beastSpecial2: "None",
            beastSpecial3: "None",

            inBattle: "false",
            lastAction: "None",
            lastDamageDealt: "0",
            lastDamageTaken: "0",
            lastCritical: "false",
            battleActionCount: "0",

            bagItems: [],
            marketItems: [],
        };
    }
    return ctx.agentMemory as LootSurvivorState;
}

// Template for the agent's context
export const template = `
You are an expert AI agent playing Loot Survivor, a roguelike dungeon crawler game on Starknet blockchain. Your goal is to progress as far as possible, defeat beasts, collect loot, and upgrade your character to become stronger.

Game Overview:
- Roguelike dungeon crawler with permadeath (once you die, you need to start over)
- Turn-based combat system with elemental effectiveness mechanics
- Character progression through XP, level-ups, and equipment upgrades
- Resource management (health, gold, items)

Combat Mechanics:
- Weapon types: Blade, Bludgeon, and Magic
- Armor materials: Cloth, Hide, and Metal
- Weapon effectiveness:
  - Blade: Weak vs Metal, Fair vs Hide, Strong vs Cloth
  - Bludgeon: Fair vs Metal, Strong vs Hide, Weak vs Cloth
  - Magic: Strong vs Metal, Weak vs Hide, Fair vs Cloth
- Stats affect combat: Strength boosts damage, Vitality increases health, etc.

Current Game State:
<adventurer_stats>
Adventurer ID: {{adventurerId}}
Health: {{adventurerHealth}}/{{adventurerMaxHealth}}
Level: {{level}}
XP: {{xp}}
Gold: {{gold}}
Battle Actions: {{battleActionCount}}
</adventurer_stats>

<adventurer_attributes>
Strength: {{strength}}
Dexterity: {{dexterity}}
Vitality: {{vitality}}
Intelligence: {{intelligence}}
Wisdom: {{wisdom}}
Charisma: {{charisma}}
Luck: {{luck}}
Available Stat Upgrades: {{statUpgrades}}
</adventurer_attributes>

<equipment>
Weapon: {{weapon}}
Chest: {{chest}}
Head: {{head}}
Waist: {{waist}}
Foot: {{foot}}
Hand: {{hand}}
Neck: {{neck}}
Ring: {{ring}}
</equipment>

<battle_status>
In Battle: {{inBattle}}
Beast: {{currentBeast}}
Beast Health: {{beastHealth}}/{{beastMaxHealth}}
Beast Level: {{beastLevel}}
Beast Tier: {{beastTier}}
Beast Type: {{beastType}}
Beast Specials: {{beastSpecial1}}, {{beastSpecial2}}, {{beastSpecial3}}
Last Action: {{lastAction}}
Last Damage Dealt: {{lastDamageDealt}}
Last Damage Taken: {{lastDamageTaken}}
Critical Hit: {{lastCritical}}
</battle_status>

<inventory>
Bag Items: {{bagItems}}
</inventory>

<market>
Available Items: {{marketItems}}
</market>

Strategic Guidelines:
1. Prioritize survival - manage your health and know when to flee
2. Choose equipment upgrades that complement your playstyle
3. Be aware of weapon effectiveness against different armor types
4. Upgrade stats strategically - Vitality for health, Strength for damage, etc.
5. Save gold for important purchases rather than buying every item
6. Assess beast difficulty before engaging in combat
7. Use your strongest equipment and keep your bag organized

Your task is to analyze the current game state and make strategic decisions. Follow these steps:

1. Analyze your current stats, health, equipment, and resources
2. Evaluate the current situation (exploring, in battle, shopping)
3. Consider the best action based on the game state
4. Explain your reasoning and decision clearly

Inside your thinking block, use <strategy_planning> tags to show your thought process:

1. Assess your current status and strengths/weaknesses
2. List possible actions and their potential outcomes
3. Weigh risks vs. rewards
4. Choose the optimal action

If you die during gameplay, start a new game immediately and continue playing. If you encounter any errors, ask the user to re-authenticate.

Output Format:
Decision: [Your chosen action]
Explanation: [A clear explanation of your decision and how it fits your strategy]
Next Steps: [Brief outline of your plan for the next few turns]

Remember to constantly adapt your strategy as the game state changes. Your goal is long-term survival and progression.
`;

// Context for the agent
export const goalContexts = context({
    type: "goal",
    schema: z.object({
        id: string(),
        initialGoal: z.string().default("Survive and progress in Loot Survivor"),
        initialTasks: z.array(z.string()).default(["Make strategic decisions", "Manage resources", "Defeat beasts"]),
    }),

    key() {
        return "1";
    },

    create(_state): LootSurvivorState {
        return {
            adventurerId: "0",
            adventurerHealth: "0",
            adventurerMaxHealth: "0",
            level: "1",
            xp: "0",
            gold: "0",
            statUpgrades: "0",

            strength: "0",
            dexterity: "0",
            vitality: "0",
            intelligence: "0",
            wisdom: "0",
            charisma: "0",
            luck: "0",

            weapon: "None",
            chest: "None",
            head: "None",
            waist: "None",
            foot: "None",
            hand: "None",
            neck: "None",
            ring: "None",

            currentBeast: "None",
            beastHealth: "0",
            beastMaxHealth: "0",
            beastLevel: "0",
            beastTier: "0",
            beastType: "0",
            beastSpecial1: "None",
            beastSpecial2: "None",
            beastSpecial3: "None",

            inBattle: "false",
            lastAction: "None",
            lastDamageDealt: "0",
            lastDamageTaken: "0",
            lastCritical: "false",
            battleActionCount: "0",

            bagItems: [],
            marketItems: [],
        };
    },

    render({ memory }) {
        return render(template, {
            adventurerId: memory.adventurerId ?? "0",
            adventurerHealth: memory.adventurerHealth ?? "0",
            adventurerMaxHealth: memory.adventurerMaxHealth ?? "0",
            level: memory.level ?? "1",
            xp: memory.xp ?? "0",
            gold: memory.gold ?? "0",
            battleActionCount: memory.battleActionCount ?? "0",

            strength: memory.strength ?? "0",
            dexterity: memory.dexterity ?? "0",
            vitality: memory.vitality ?? "0",
            intelligence: memory.intelligence ?? "0",
            wisdom: memory.wisdom ?? "0",
            charisma: memory.charisma ?? "0",
            luck: memory.luck ?? "0",
            statUpgrades: memory.statUpgrades ?? "0",

            weapon: memory.weapon ?? "None",
            chest: memory.chest ?? "None",
            head: memory.head ?? "None",
            waist: memory.waist ?? "None",
            foot: memory.foot ?? "None",
            hand: memory.hand ?? "None",
            neck: memory.neck ?? "None",
            ring: memory.ring ?? "None",

            currentBeast: memory.currentBeast ?? "None",
            beastHealth: memory.beastHealth ?? "0",
            beastMaxHealth: memory.beastMaxHealth ?? "0",
            beastLevel: memory.beastLevel ?? "0",
            beastTier: memory.beastTier ?? "0",
            beastType: memory.beastType ?? "0",
            beastSpecial1: memory.beastSpecial1 ?? "None",
            beastSpecial2: memory.beastSpecial2 ?? "None",
            beastSpecial3: memory.beastSpecial3 ?? "None",

            inBattle: memory.inBattle ?? "false",
            lastAction: memory.lastAction ?? "None",
            lastDamageDealt: memory.lastDamageDealt ?? "0",
            lastDamageTaken: memory.lastDamageTaken ?? "0",
            lastCritical: memory.lastCritical ?? "false",

            bagItems: memory.bagItems?.join(", ") ?? "None",
            marketItems: memory.marketItems?.join(", ") ?? "None",
        } as any);
    },
});

// Create the Loot Survivor agent with UI integration
export const lootSurvivor = extension({
    name: "lootSurvivor",
    contexts: {
        goal: goalContexts,
    },
    actions: [
        /**
         * Action to start a new game
         */
        action({
            name: "newGame",
            description: "Start a new game in Loot Survivor",
            schema: z
                .object({
                    startingWeapon: z
                        .enum(["Katana", "Warhammer", "Ghost Wand"])
                        .describe("The weapon to start with (Blade, Bludgeon, or Magic type)"),
                    name: z
                        .string()
                        .describe("The name of your adventurer"),
                    characterClass: z
                        .enum(["Warrior", "Ranger", "Mage", "Rogue", "Paladin"])
                        .describe("The class of your adventurer"),
                })
                .describe("Start a new game with a chosen weapon, name, and class."),
            async handler(
                call: ActionCall<{
                    startingWeapon: "Katana" | "Warhammer" | "Ghost Wand";
                    name: string;
                    characterClass: "Warrior" | "Ranger" | "Mage" | "Rogue" | "Paladin";
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Starting New Game - Weapon: ${call.data.startingWeapon}, Class: ${call.data.characterClass}`);

                    const { startingWeapon, name, characterClass } = call.data;

                    // Map starting weapon to weapon ID
                    const weaponIdMap: Record<string, number> = {
                        "Katana": 1,
                        "Warhammer": 6,
                        "Ghost Wand": 11
                    };

                    const weaponId = weaponIdMap[startingWeapon] || 1;

                    console.log(`[STARKNET] Calling new_game function on contract`);

                    // Updated to match ABI parameters
                    const result = await starknet.write({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "new_game",
                        calldata: [
                            env.STARKNET_ADDRESS, // client_reward_address (using our configured address)
                            weaponId,             // weapon
                            Buffer.from(name).toString('hex'), // name
                            0,                    // golden_token_id (default 0)
                            0,                    // delay_reveal (false)
                            0,                    // custom_renderer (0x0 address)
                            0,                    // launch_tournament_winner_token_id (0)
                            env.STARKNET_ADDRESS  // mint_to (using our configured address)
                        ]
                    });

                    console.log(`[STARKNET] Transaction hash: ${result.transaction_hash}`);

                    // Create a new adventurer ID from the transaction hash or result
                    const adventurerId = result.transaction_hash || "unknown";

                    // Get the new adventurer state
                    const state = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);

                    if (!state) {
                        return {
                            success: false,
                            error: "Failed to retrieve adventurer state after creation",
                            message: "Failed to start a new game",
                        };
                    }

                    // Update the memory state
                    const memoryState = initializeLootSurvivorMemory(ctx);
                    Object.assign(memoryState, state);

                    // Also set a few additional values specific to new game
                    memoryState.lastAction = "New Game";
                    memoryState.weapon = startingWeapon; // Make sure the correct weapon name is set

                    console.log(`[ACTION] New Game Created - Adventurer ID: ${memoryState.adventurerId}`);
                    printGameState(memoryState);

                    return {
                        success: true,
                        message: `Successfully started a new game with ${startingWeapon} and character class ${characterClass}`,
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to start new game:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to start a new game",
                    };
                }
            },
        }),

        /**
         * Action to explore the world
         */
        action({
            name: "explore",
            description: "Explore the world to find beasts, obstacles, or treasures",
            schema: z
                .object({
                    adventurerId: z
                        .string()
                        .describe("The ID of your adventurer"),
                    tillBeast: z
                        .boolean()
                        .default(false)
                        .describe("Whether to explore until finding a beast (true) or just once (false)"),
                })
                .describe("Explore the world to discover beasts, obstacles, or treasures"),
            async handler(
                call: ActionCall<{
                    adventurerId: string;
                    tillBeast: boolean;
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Exploring - Adventurer ID: ${call.data.adventurerId}, Till Beast: ${call.data.tillBeast}`);

                    const { adventurerId, tillBeast } = call.data;

                    // Get the initial state to compare later
                    const initialState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!initialState) {
                        return {
                            success: false,
                            error: "Failed to retrieve initial adventurer state",
                            message: "Failed to explore: could not get adventurer state",
                        };
                    }

                    // Use Starknet to call explore function
                    console.log(`[STARKNET] Calling explore function on contract`);
                    const exploreResult = await starknet.write({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "explore",
                        calldata: [
                            adventurerId,
                            tillBeast ? 1 : 0  // Convert boolean to 0/1
                        ]
                    });

                    console.log(`[STARKNET] Transaction hash: ${exploreResult.transaction_hash}`);
                    console.log(`[STARKNET] Waiting for transaction confirmation...`);

                    // Get updated state after exploring
                    const updatedState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!updatedState) {
                        return {
                            success: false,
                            error: "Failed to retrieve updated adventurer state",
                            message: "Failed to explore: could not get updated adventurer state",
                        };
                    }

                    // Update the agent memory with the state
                    const state = initializeLootSurvivorMemory(ctx);
                    Object.assign(state, updatedState);

                    // Determine what happened during exploration by comparing before/after states

                    // Check for beast encounter
                    if (updatedState.inBattle === "true") {
                        state.lastAction = "Discovered Beast";
                        console.log(`[ENCOUNTER] Found Beast: ${state.currentBeast} (Level ${state.beastLevel})`);
                    }
                    // Check for health decrease (obstacle)
                    else if (parseInt(updatedState.adventurerHealth) < parseInt(initialState.adventurerHealth)) {
                        const damageTaken = parseInt(initialState.adventurerHealth) - parseInt(updatedState.adventurerHealth);
                        state.lastAction = "Encountered Obstacle";
                        state.lastDamageTaken = damageTaken.toString();
                        console.log(`[ENCOUNTER] Obstacle: Took ${damageTaken} damage`);
                    }
                    // Check for gold increase (discovery)
                    else if (parseInt(updatedState.gold) > parseInt(initialState.gold)) {
                        const goldFound = parseInt(updatedState.gold) - parseInt(initialState.gold);
                        state.lastAction = `Found ${goldFound} Gold`;
                        console.log(`[DISCOVERY] Found ${goldFound} Gold`);
                    }
                    // Check if health increased (health discovery)
                    else if (parseInt(updatedState.adventurerHealth) > parseInt(initialState.adventurerHealth)) {
                        const healthFound = parseInt(updatedState.adventurerHealth) - parseInt(initialState.adventurerHealth);
                        state.lastAction = `Found ${healthFound} Health`;
                        console.log(`[DISCOVERY] Found ${healthFound} Health`);

                        // Check if new health exceeds max health
                        if (parseInt(state.adventurerHealth) > parseInt(state.adventurerMaxHealth)) {
                            state.adventurerMaxHealth = state.adventurerHealth;
                        }
                    }
                    // Check if bag items count changed (item discovery)
                    else if (updatedState.bagItems.length > initialState.bagItems.length) {
                        // Find the new item by comparing arrays
                        const newItems = updatedState.bagItems.filter(item => !initialState.bagItems.includes(item));
                        if (newItems.length > 0) {
                            state.lastAction = `Found Item: ${newItems[0]}`;
                            console.log(`[DISCOVERY] Found Item: ${newItems[0]}`);
                        } else {
                            state.lastAction = "Found an Item";
                            console.log(`[DISCOVERY] Found an item`);
                        }
                    }
                    // Nothing interesting happened
                    else {
                        state.lastAction = "Explored area, found nothing";
                        console.log(`[EXPLORATION] Found nothing of interest`);
                    }

                    console.log(`[ACTION] Exploration Complete - ${state.lastAction}`);
                    printGameState(state);

                    return {
                        success: true,
                        message: `Exploration complete. ${state.lastAction}`,
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to explore:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to explore",
                    };
                }
            },
        }),

        /**
         * Action to attack a beast
         */
        action({
            name: "attackBeast",
            description: "Attack the beast you're currently facing",
            schema: z
                .object({
                    adventurerId: z
                        .string()
                        .describe("The ID of your adventurer"),
                    toTheDeath: z
                        .boolean()
                        .default(false)
                        .describe("Whether to fight to the death (true) or just attack once (false)"),
                })
                .describe("Attack the beast you encountered"),
            async handler(
                call: ActionCall<{
                    adventurerId: string;
                    toTheDeath: boolean;
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Attacking Beast - Adventurer ID: ${call.data.adventurerId}, To Death: ${call.data.toTheDeath}`);

                    const { adventurerId, toTheDeath } = call.data;

                    // Get initial state to compare with later
                    const initialState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!initialState) {
                        return {
                            success: false,
                            error: "Failed to retrieve initial adventurer state",
                            message: "Failed to attack: could not get adventurer state",
                        };
                    }

                    // Make sure we're in battle
                    if (initialState.inBattle !== "true") {
                        return {
                            success: false,
                            error: "Not in battle",
                            message: "Cannot attack: you are not in battle with a beast",
                        };
                    }

                    console.log(`[STARKNET] Calling attack function on contract`);
                    const attackResult = await starknet.write({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "attack",
                        calldata: [
                            adventurerId,
                            toTheDeath ? 1 : 0  // Convert boolean to 0/1
                        ]
                    });

                    console.log(`[STARKNET] Transaction hash: ${attackResult.transaction_hash}`);
                    console.log(`[STARKNET] Waiting for transaction confirmation...`);

                    // Get updated state after attacking
                    const updatedState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!updatedState) {
                        return {
                            success: false,
                            error: "Failed to retrieve updated adventurer state",
                            message: "Failed to attack: could not get updated adventurer state",
                        };
                    }

                    // Update the agent memory with the state
                    const state = initializeLootSurvivorMemory(ctx);
                    Object.assign(state, updatedState);

                    // Determine what happened during battle by comparing before/after states

                    // Calculate damage dealt to beast
                    const damageDealt = parseInt(initialState.beastHealth) - parseInt(updatedState.beastHealth);
                    state.lastDamageDealt = Math.max(0, damageDealt).toString();

                    // Calculate damage taken by adventurer
                    const damageTaken = parseInt(initialState.adventurerHealth) - parseInt(updatedState.adventurerHealth);
                    state.lastDamageTaken = Math.max(0, damageTaken).toString();

                    // We don't know if it was critical without event logs, so default is false
                    state.lastCritical = "false";

                    // Check if beast was defeated
                    const beastDefeated = parseInt(updatedState.beastHealth) <= 0;

                    // Check if adventurer died
                    const adventurerDied = parseInt(updatedState.adventurerHealth) <= 0;

                    // Check for XP and gold gains
                    const xpGained = parseInt(updatedState.xp) - parseInt(initialState.xp);
                    const goldGained = parseInt(updatedState.gold) - parseInt(initialState.gold);

                    // Set appropriate action based on outcome
                    if (adventurerDied) {
                        state.lastAction = "Adventurer Died";
                        console.log(`[DEATH] Your adventurer has been slain!`);
                    } else if (beastDefeated) {
                        state.lastAction = "Slayed Beast";
                        console.log(`[VICTORY] Beast slain!`);

                        if (xpGained > 0) {
                            console.log(`[REWARD] Earned ${xpGained} XP`);
                        }

                        if (goldGained > 0) {
                            console.log(`[REWARD] Earned ${goldGained} Gold`);
                        }
                    } else {
                        state.lastAction = "Attacked Beast";
                        console.log(`[BATTLE] Attacked beast, dealt ${state.lastDamageDealt} damage, took ${state.lastDamageTaken} damage`);
                    }

                    // Check for level up
                    const initialLevel = parseInt(initialState.level);
                    const updatedLevel = parseInt(updatedState.level);
                    if (updatedLevel > initialLevel) {
                        console.log(`[LEVEL UP] Advanced to level ${updatedLevel}! Available stat points: ${updatedState.statUpgrades}`);
                    }

                    console.log(`[ACTION] Attack Complete - ${state.lastAction}`);
                    printGameState(state);

                    return {
                        success: true,
                        message: `${state.lastAction}. Damage dealt: ${state.lastDamageDealt}, Damage taken: ${state.lastDamageTaken}`,
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to attack beast:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to attack beast",
                    };
                }
            },
        }),

        /**
         * Action to flee from a beast
         */
        action({
            name: "fleeBeast",
            description: "Try to flee from the beast you're currently facing",
            schema: z
                .object({
                    adventurerId: z
                        .string()
                        .describe("The ID of your adventurer"),
                    toTheDeath: z
                        .boolean()
                        .default(false)
                        .describe("Always false as this is a flee attempt"),
                })
                .describe("Try to flee from the beast you encountered"),
            async handler(
                call: ActionCall<{
                    adventurerId: string;
                    toTheDeath: boolean;
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Attempting to Flee - Adventurer ID: ${call.data.adventurerId}`);

                    const { adventurerId, toTheDeath } = call.data;

                    // Get initial state to compare with later
                    const initialState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!initialState) {
                        return {
                            success: false,
                            error: "Failed to retrieve initial adventurer state",
                            message: "Failed to flee: could not get adventurer state",
                        };
                    }

                    // Make sure we're in battle
                    if (initialState.inBattle !== "true") {
                        return {
                            success: false,
                            error: "Not in battle",
                            message: "Cannot flee: you are not in battle with a beast",
                        };
                    }

                    // Use Starknet to call flee function
                    console.log(`[STARKNET] Calling flee function on contract`);
                    const fleeResult = await starknet.write({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "flee",
                        calldata: [
                            adventurerId,
                            toTheDeath ? 1 : 0  // Typically should be 0 for flee
                        ]
                    });

                    console.log(`[STARKNET] Transaction hash: ${fleeResult.transaction_hash}`);
                    console.log(`[STARKNET] Waiting for transaction confirmation...`);

                    // Get updated state after flee attempt
                    const updatedState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!updatedState) {
                        return {
                            success: false,
                            error: "Failed to retrieve updated adventurer state",
                            message: "Failed to flee: could not get updated adventurer state",
                        };
                    }

                    // Update the agent memory with the state
                    const state = initializeLootSurvivorMemory(ctx);
                    Object.assign(state, updatedState);

                    // Determine what happened during flee attempt by comparing before/after states

                    // Calculate damage taken during flee attempt
                    const damageTaken = parseInt(initialState.adventurerHealth) - parseInt(updatedState.adventurerHealth);
                    state.lastDamageTaken = Math.max(0, damageTaken).toString();
                    state.lastDamageDealt = "0"; // We don't deal damage during flee attempts

                    // Check if flee was successful
                    // If we're no longer in battle after fleeing, it was successful
                    const fleeSuccessful = updatedState.inBattle === "false";

                    // Check if adventurer died
                    const adventurerDied = parseInt(updatedState.adventurerHealth) <= 0;

                    // Set appropriate action based on outcome
                    if (adventurerDied) {
                        state.lastAction = "Adventurer Died while Fleeing";
                        console.log(`[DEATH] Your adventurer died while attempting to flee!`);
                    } else if (fleeSuccessful) {
                        state.lastAction = "Fled Successfully";
                        console.log(`[FLEE] Successfully escaped from the beast!`);
                    } else {
                        state.lastAction = "Failed to Flee";
                        if (damageTaken > 0) {
                            console.log(`[FLEE] Failed to escape and took ${damageTaken} damage!`);
                        } else {
                            console.log(`[FLEE] Failed to escape!`);
                        }
                    }

                    console.log(`[ACTION] Flee Attempt Complete - ${state.lastAction}`);
                    printGameState(state);

                    return {
                        success: true,
                        message: state.lastAction,
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to flee from beast:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to flee from beast",
                    };
                }
            },
        }),

        /**
         * Action to equip items
         */
        action({
            name: "equipItems",
            description: "Equip items from your bag",
            schema: z
                .object({
                    adventurerId: z
                        .string()
                        .describe("The ID of your adventurer"),
                    items: z
                        .array(z.number())
                        .describe("Array of item IDs to equip"),
                })
                .describe("Equip items from your bag"),
            async handler(
                call: ActionCall<{
                    adventurerId: string;
                    items: number[];
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Equipping Items - Adventurer ID: ${call.data.adventurerId}, Items: ${call.data.items.join(', ')}`);

                    const { adventurerId, items } = call.data;

                    // Get initial state to compare with later
                    const initialState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!initialState) {
                        return {
                            success: false,
                            error: "Failed to retrieve initial adventurer state",
                            message: "Failed to equip items: could not get adventurer state",
                        };
                    }

                    // Use Starknet to call equip function
                    console.log(`[STARKNET] Calling equip function on contract`);

                    // Prepare items for the ABI format
                    const equipResult = await starknet.write({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "equip",
                        calldata: [
                            adventurerId,
                            items.length, // First provide the array length
                            ...items      // Then the items themselves
                        ]
                    });

                    console.log(`[STARKNET] Transaction hash: ${equipResult.transaction_hash}`);
                    console.log(`[STARKNET] Waiting for transaction confirmation...`);

                    // Get updated state after equipping items
                    const updatedState = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);
                    if (!updatedState) {
                        return {
                            success: false,
                            error: "Failed to retrieve updated adventurer state",
                            message: "Failed to equip items: could not get updated adventurer state",
                        };
                    }

                    // Update the agent memory with the state
                    const state = initializeLootSurvivorMemory(ctx);
                    Object.assign(state, updatedState);

                    // Find items that were equipped (by comparing before/after equipment)
                    const initialEquipment = [
                        initialState.weapon,
                        initialState.chest,
                        initialState.head,
                        initialState.waist,
                        initialState.foot,
                        initialState.hand,
                        initialState.neck,
                        initialState.ring
                    ].filter(item => item !== "None");

                    const updatedEquipment = [
                        updatedState.weapon,
                        updatedState.chest,
                        updatedState.head,
                        updatedState.waist,
                        updatedState.foot,
                        updatedState.hand,
                        updatedState.neck,
                        updatedState.ring
                    ].filter(item => item !== "None");

                    // Get newly equipped items
                    const newlyEquipped = updatedEquipment.filter(item => !initialEquipment.includes(item));

                    // Log the results
                    console.log(`[EQUIP] Updated equipment:`);
                    console.log(`  Weapon: ${state.weapon}`);
                    console.log(`  Chest: ${state.chest}`);
                    console.log(`  Head: ${state.head}`);
                    console.log(`  Waist: ${state.waist}`);
                    console.log(`  Foot: ${state.foot}`);
                    console.log(`  Hand: ${state.hand}`);
                    console.log(`  Neck: ${state.neck}`);
                    console.log(`  Ring: ${state.ring}`);

                    if (newlyEquipped.length > 0) {
                        console.log(`[EQUIP] Newly equipped items: ${newlyEquipped.join(', ')}`);
                    }

                    if (updatedState.bagItems.length < initialState.bagItems.length) {
                        console.log(`[BAG] Updated bag contents: ${state.bagItems.join(', ') || 'Empty'}`);
                    }

                    state.lastAction = "Equipped Items";

                    console.log(`[ACTION] Equipment Complete`);
                    printGameState(state);

                    return {
                        success: true,
                        message: `Successfully equipped items`,
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to equip items:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to equip items",
                    };
                }
            },
        }),

        /**
         * Action to upgrade stats and buy items
         */
        action({
            name: "upgradeAdventurer",
            description: "Upgrade stats and purchase items",
            schema: z
                .object({
                    adventurerId: z
                        .string()
                        .describe("The ID of your adventurer"),
                    potions: z
                        .number()
                        .default(0)
                        .describe("Number of potions to purchase"),
                    statUpgrades: z
                        .object({
                            strength: z.number().default(0),
                            dexterity: z.number().default(0),
                            vitality: z.number().default(0),
                            intelligence: z.number().default(0),
                            wisdom: z.number().default(0),
                            charisma: z.number().default(0),
                        })
                        .describe("Stats to upgrade"),
                    items: z
                        .array(
                            z.object({
                                item_id: z.number(),
                                equip: z.boolean(),
                            })
                        )
                        .default([])
                        .describe("Items to purchase and optionally equip"),
                })
                .describe("Upgrade stats and purchase items"),
            async handler(
                call: ActionCall<{
                    adventurerId: string;
                    potions: number;
                    statUpgrades: {
                        strength: number;
                        dexterity: number;
                        vitality: number;
                        intelligence: number;
                        wisdom: number;
                        charisma: number;
                    };
                    items: {
                        item_id: number;
                        equip: boolean;
                    }[];
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Upgrading Adventurer - ID: ${call.data.adventurerId}`);
                    const { adventurerId, potions, statUpgrades, items } = call.data;

                    // Log stat upgrades
                    const statKeys = Object.keys(statUpgrades);
                    for (const key of statKeys) {
                        const val = statUpgrades[key as keyof typeof statUpgrades];
                        if (val > 0) {
                            console.log(`[UPGRADE] ${key.charAt(0).toUpperCase() + key.slice(1)}: +${val} points`);
                        }
                    }

                    // Log potion purchase
                    if (potions > 0) {
                        console.log(`[PURCHASE] Buying ${potions} potions`);
                    }

                    // Log item purchases
                    if (items.length > 0) {
                        console.log(`[PURCHASE] Buying ${items.length} items`);
                    }

                    // The ABI shows we can do this all in one call with the "upgrade" function
                    console.log(`[STARKNET] Calling upgrade function on contract`);

                    // Create StatUpgrades structure according to the ABI
                    // For the ABI, we need to match the exact structure of adventurer::stats::Stats

                    // Convert items array to the format expected by the contract
                    const itemsArray = items.map(item => ({
                        item_id: item.item_id,
                        equip: item.equip ? 1 : 0 // Convert boolean to 0/1
                    }));

                    const upgradeResult = await starknet.write({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "upgrade",
                        calldata: [
                            adventurerId,
                            potions,
                            // Stats structure
                            statUpgrades.strength,
                            statUpgrades.dexterity,
                            statUpgrades.vitality,
                            statUpgrades.intelligence,
                            statUpgrades.wisdom,
                            statUpgrades.charisma,
                            0, // luck (not in our input schema, default to 0)
                            // Items array
                            items.length,
                            ...items.flatMap(item => [item.item_id, item.equip ? 1 : 0])
                        ]
                    });

                    console.log(`[STARKNET] Upgrade transaction hash: ${upgradeResult.transaction_hash}`);
                    console.log(`[STARKNET] Waiting for transaction confirmation...`);

                    // Now get updated adventurer state
                    console.log(`[STARKNET] Getting updated adventurer state`);
                    const adventurerResult = await starknet.read({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: "get_adventurer",
                        calldata: [adventurerId]
                    });

                    // Update the state based on upgrade results
                    const state = initializeLootSurvivorMemory(ctx);

                    if (adventurerResult && !adventurerResult.message) {
                        // Use our parser function to handle the flat array response
                        const adventurerData = parseAdventurerData(adventurerResult.result || adventurerResult);

                        // Calculate level
                        const xpNumber = parseInt(adventurerData.xp);
                        const level = Math.floor(Math.sqrt(xpNumber / 100)) + 1;

                        // Map item IDs to names
                        const getItemName = (item: { id: string, xp: string }): string => {
                            if (!item || item.id === "0") return "None";

                            // Complete item mapping based on loot/constants/ItemId
                            const itemTypes: { [key: number]: string } = {
                                0: "None",
                                1: "Pendant",
                                2: "Necklace",
                                3: "Amulet",
                                4: "Silver Ring",
                                5: "Bronze Ring",
                                6: "Platinum Ring",
                                7: "Titanium Ring",
                                8: "Gold Ring",
                                9: "Ghost Wand",
                                10: "Grave Wand",
                                11: "Bone Wand",
                                12: "Wand",
                                13: "Grimoire",
                                14: "Chronicle",
                                15: "Tome",
                                16: "Book",
                                17: "Divine Robe",
                                18: "Silk Robe",
                                19: "Linen Robe",
                                20: "Robe",
                                21: "Shirt",
                                22: "Crown",
                                23: "Divine Hood",
                                24: "Silk Hood",
                                25: "Linen Hood",
                                26: "Hood",
                                27: "Brightsilk Sash",
                                28: "Silk Sash",
                                29: "Wool Sash",
                                30: "Linen Sash",
                                31: "Sash",
                                32: "Divine Slippers",
                                33: "Silk Slippers",
                                34: "Wool Shoes",
                                35: "Linen Shoes",
                                36: "Shoes",
                                37: "Divine Gloves",
                                38: "Silk Gloves",
                                39: "Wool Gloves",
                                40: "Linen Gloves",
                                41: "Gloves",
                                42: "Katana",
                                43: "Falchion",
                                44: "Scimitar",
                                45: "Long Sword",
                                46: "Short Sword",
                                47: "Demon Husk",
                                48: "Dragonskin Armor",
                                49: "Studded Leather Armor",
                                50: "Hard Leather Armor",
                                51: "Leather Armor",
                                52: "Demon Crown",
                                53: "Dragon's Crown",
                                54: "War Cap",
                                55: "Leather Cap",
                                56: "Cap",
                                57: "Demonhide Belt",
                                58: "Dragonskin Belt",
                                59: "Studded Leather Belt",
                                60: "Hard Leather Belt",
                                61: "Leather Belt",
                                62: "Demonhide Boots",
                                63: "Dragonskin Boots",
                                64: "Studded Leather Boots",
                                65: "Hard Leather Boots",
                                66: "Leather Boots",
                                67: "Demon's Hands",
                                68: "Dragonskin Gloves",
                                69: "Studded Leather Gloves",
                                70: "Hard Leather Gloves",
                                71: "Leather Gloves",
                                72: "Warhammer",
                                73: "Quarterstaff",
                                74: "Maul",
                                75: "Mace",
                                76: "Club",
                                77: "Holy Chestplate",
                                78: "Ornate Chestplate",
                                79: "Plate Mail",
                                80: "Chain Mail",
                                81: "Ring Mail",
                                82: "Ancient Helm",
                                83: "Ornate Helm",
                                84: "Great Helm",
                                85: "Full Helm",
                                86: "Helm",
                                87: "Ornate Belt",
                                88: "War Belt",
                                89: "Plated Belt",
                                90: "Mesh Belt",
                                91: "Heavy Belt",
                                92: "Holy Greaves",
                                93: "Ornate Greaves",
                                94: "Greaves",
                                95: "Chain Boots",
                                96: "Heavy Boots",
                                97: "Holy Gauntlets",
                                98: "Ornate Gauntlets",
                                99: "Gauntlets",
                                100: "Chain Gloves",
                                101: "Heavy Gloves"
                            };

                            const id = parseInt(item.id);
                            return itemTypes[id] || `Item #${id}`;
                        };

                        // Update adventurer stats
                        state.adventurerHealth = adventurerData.health;
                        state.adventurerMaxHealth = adventurerData.health; // Max health based on current health
                        state.xp = adventurerData.xp;
                        state.gold = adventurerData.gold;
                        state.level = level.toString();
                        state.statUpgrades = adventurerData.stat_upgrades_available;

                        // Update stats
                        state.strength = adventurerData.stats.strength;
                        state.dexterity = adventurerData.stats.dexterity;
                        state.vitality = adventurerData.stats.vitality;
                        state.intelligence = adventurerData.stats.intelligence;
                        state.wisdom = adventurerData.stats.wisdom;
                        state.charisma = adventurerData.stats.charisma;
                        state.luck = adventurerData.stats.luck;

                        // Update equipment
                        state.weapon = getItemName(adventurerData.equipment.weapon);
                        state.chest = getItemName(adventurerData.equipment.chest);
                        state.head = getItemName(adventurerData.equipment.head);
                        state.waist = getItemName(adventurerData.equipment.waist);
                        state.foot = getItemName(adventurerData.equipment.foot);
                        state.hand = getItemName(adventurerData.equipment.hand);
                        state.neck = getItemName(adventurerData.equipment.neck);
                        state.ring = getItemName(adventurerData.equipment.ring);

                        // Beast health
                        state.beastHealth = adventurerData.beast_health;

                        // Check if in battle
                        state.inBattle = parseInt(adventurerData.beast_health) > 0 ? "true" : "false";

                        // If in battle, get beast details
                        if (parseInt(adventurerData.beast_health) > 0) {
                            try {
                                console.log(`[STARKNET] Calling get_attacking_beast function`);
                                const beastResult = await starknet.read({
                                    contractAddress: GAME_CONTRACT_ADDRESS,
                                    entrypoint: "get_attacking_beast",
                                    calldata: [adventurerId]
                                });

                                console.log(`[STARKNET] Raw beast result:`, JSON.stringify(beastResult));

                                if (beastResult && !beastResult.message) {
                                    const beastData = parseBeastData(beastResult.result || beastResult);

                                    state.currentBeast = getBeastName(beastData.id);
                                    state.beastMaxHealth = beastData.starting_health;
                                    state.beastLevel = beastData.combat_spec.level;
                                    state.beastTier = getBeastTier(beastData.combat_spec.tier);
                                    state.beastType = getBeastType(beastData.combat_spec.item_type);
                                    state.beastSpecial1 = beastData.combat_spec.specials.special1;
                                    state.beastSpecial2 = beastData.combat_spec.specials.special2;
                                    state.beastSpecial3 = beastData.combat_spec.specials.special3;
                                }
                            } catch (beastError) {
                                console.log(`[STARKNET] Could not retrieve beast details: ${beastError}`);
                            }
                        }

                        // battle action count
                        state.battleActionCount = adventurerData.battle_action_count;

                        // Get bag contents
                        try {
                            const bagResult = await starknet.read({
                                contractAddress: GAME_CONTRACT_ADDRESS,
                                entrypoint: "get_bag",
                                calldata: [adventurerId]
                            });

                            if (bagResult && !bagResult.message && (bagResult.result || bagResult)) {
                                const rawBag = bagResult.result || bagResult;
                                state.bagItems = [];

                                // The bag in the contract is a struct with 15 items
                                // Each item has id and xp fields
                                for (let i = 0; i < 15; i++) {
                                    // In the array response, items are consecutive
                                    // item1.id, item1.xp, item2.id, item2.xp, ...
                                    const itemIdIndex = i * 2; // ID at even indices
                                    const itemXpIndex = i * 2 + 1; // XP at odd indices

                                    if (itemIdIndex < rawBag.length && rawBag[itemIdIndex] !== "0x0") {
                                        const itemId = hexToDec(rawBag[itemIdIndex]);
                                        if (itemId !== "0") {
                                            const itemName = getItemName({ id: itemId, xp: "0" });
                                            state.bagItems.push(itemName);
                                        }
                                    }
                                }
                            }
                        } catch (bagError) {
                            console.log(`[STARKNET] Could not retrieve bag items: ${bagError}`);
                        }

                        state.lastAction = "Upgraded Adventurer";
                    }

                    console.log(`[ACTION] Upgrade Complete`);
                    printGameState(state);

                    return {
                        success: true,
                        result: adventurerResult,
                        message: `Successfully upgraded adventurer stats and purchased items`,
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to upgrade adventurer:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to upgrade adventurer",
                    };
                }
            },
        }),

        /**
         * Action to get the current state of the adventurer
         */
        action({
            name: "getAdventurerState",
            description: "Get the current state of your adventurer",
            schema: z
                .object({
                    adventurerId: z
                        .string()
                        .describe("The ID of your adventurer"),
                })
                .describe("Get the current state of your adventurer"),
            async handler(
                call: ActionCall<{
                    adventurerId: string;
                }>,
                ctx: any,
                _agent: Agent
            ) {
                try {
                    console.log(`[ACTION] Getting Adventurer State - ID: ${call.data.adventurerId}`);

                    const { adventurerId } = call.data;

                    // Use the utility function to get the state
                    const state = await getAdventurerState(GAME_CONTRACT_ADDRESS, adventurerId);

                    if (!state) {
                        return {
                            success: false,
                            error: "Failed to retrieve adventurer state",
                            message: "Failed to get adventurer state",
                        };
                    }

                    // Update the agent memory with the state
                    const memoryState = initializeLootSurvivorMemory(ctx);
                    Object.assign(memoryState, state);

                    console.log(`[ACTION] State Retrieved Successfully`);
                    printGameState(memoryState);

                    return {
                        success: true,
                        message: "Successfully retrieved adventurer state",
                    };
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : String(error);
                    console.error("[ERROR] Failed to get adventurer state:", errorMessage);

                    return {
                        success: false,
                        error: errorMessage,
                        message: "Failed to get adventurer state",
                    };
                }
            },
        }),
    ],
});

// Initialize the agent
createDreams({
    logger: LogLevel.INFO,
    model: anthropic("claude-3-7-sonnet-latest"),
    extensions: [cli, lootSurvivor],
    context: goalContexts,
    actions: [],
}).start({
    id: "loot-survivor-game",
    initialGoal: "Progress as far as possible in Loot Survivor, defeat beasts, collect loot, and upgrade your character.",
    initialTasks: [
        "Check adventurer state",
        "Start a new game if needed",
        "Explore and battle beasts strategically",
        "Manage equipment and upgrades",
        "Make decisions based on health and beast strength"
    ]
});

console.log("Loot Survivor agent is now running! The agent will play the game through CLI.");
