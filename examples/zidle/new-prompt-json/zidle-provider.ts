export const ZIDLE_PROVIDER = `{
  "executionRules": [
    "MUST generate only actions when all required data is available.",
    "MUST wait for each action's response before planning the next step.",
    "MUST validate that all required data is present before queueing any action.",
    "MUST re-evaluate the plan after each action completes."
  ],

  "variableManagement": [
    "CRITICAL: BEFORE sending any action or query, scan the entire payload for placeholder strings 
    (e.g. \"$TOKEN_ID_LOW\", \"$WALLET_ADDRESS\", etc.) and REPLACE them with the corresponding values from the agent's memory.",
    "CRITICAL: Use the TOKEN_ID_LOW value from CHECK_NFT[0].",
    "DO NOT use TOKEN_ID_HIGH under any circumstances.",
    "IF any placeholder remains unreplaced, DO NOT send the request and log an error."
  ],

  "substitutionExamples": [
    {
      "description": "Substituting $TOKEN_ID_LOW in a GraphQL query",
      "before": "query { zidleMinerModels(where: { token_id: $TOKEN_ID_LOW, timestampGT: \"0\" }) { totalCount } }",
      "assign": { "$TOKEN_ID_LOW": "0x6" },
      "after": "query { zidleMinerModels(where: { token_id: \"0x6\", timestampGT: \"0\" }) { totalCount } }",
    },
    {
      "description": "Substituting $TOKEN_ID_LOW in a transaction calldata",
      "before": "calldata: ['$TOKEN_ID_LOW', '$RESOURCE_TYPE']",
      "assign": { "$TOKEN_ID_LOW": "0x6", "$RESOURCE_TYPE": "1" },
      "after":  "calldata: ['0x6', '1']"
    }
  ],

  "wallet": {
    "accountAddress": "0x6daf2a924fab727ae5409f0743de4869850f988b6f8545268016ad1107fd2cd"
  },

  "contracts": {
    "goldErc20": "0x041a8602ddf005594d1a6149325eaa21a103216a15c2883188ee912ed9a59cb0",
    "characterNft": "0x051d88174534ea0e084f1eb6669da78a1e3a0c1fe4fd23542397815385550cd2",
    "characterSystem": "0x7065f221124ca95cbba9d863bae35d498e32bfa2a5047a01c5c8dec35e0d1d8",
    "resourcesSystem": "0x46a51d013617a242a1aacb1bebc2bb55e46f1291e5078e51517907c2983856e",
    "pvpSystem": "0x4bc66fb0bc5d4d860b2a59c50530009c3782ab9172c6a2cdb33f3daa1c450ec"
  },

  "providerGuide": {
    "actions": [
      {
        "name": "CHECK_NFT",
        "type": "EXECUTE_READ",
        "contract": "$CHARACTER_NFT",
        "entrypoint": "token_of_owner_by_index",
        "calldata": ["$WALLET_ADDRESS", 5, 0],
        "returns": [TOKEN_ID_LOW, TOKEN_ID_HIGH]
      },
      {
        "name": "GET_NFT_WALLET_ADDRESS",
        "type": "EXECUTE_READ",
        "contract": "$CHARACTER_NFT",
        "entrypoint": "wallet_of",
        "calldata": ["$TOKEN_ID_LOW", "$TOKEN_ID_HIGH"],
        "returns": [NFT_WALLET_ADDRESS]
      },
      {
        "name": "GET_GOLD_BALANCE",
        "type": "EXECUTE_READ",
        "contract": "$GOLD_ERC20",
        "entrypoint": "balance_of",
        "calldata": ["$WALLET_ADDRESS"],
        "returns": [GOLD_BALANCE_LOW, GOLD_BALANCE_HIGH],
        "notes": [
          "Gold ERC20 has 0 decimals, so balance is in whole units.",
          "Compare GOLD_BALANCE_LOW directly to target (e.g., 50)."
        ]
      },
      {
        "name": "MINE_RCS",
        "type": "EXECUTE_TRANSACTION",
        "contract": "$RESOURCES_SYSTEM",
        "entrypoint": "mine",
        "calldata": ["$TOKEN_ID_LOW", "$RESOURCE_TYPE", "$RESOURCE_SUBTYPE"]
      },
      {
        "name": "HARVEST_RCS",
        "type": "EXECUTE_TRANSACTION",
        "contract": "$RESOURCES_SYSTEM",
        "entrypoint": "harvest",
        "calldata": ["$TOKEN_ID_LOW", "$RESOURCE_TYPE"]
      },
      {
        "name": "SELL_RCS_FOR_GOLD",
        "type": "EXECUTE_TRANSACTION",
        "contract": "$RESOURCES_SYSTEM",
        "entrypoint": "sell",
        "calldata": ["$TOKEN_ID_LOW", "$RESOURCE_TYPE", "$RESOURCE_SUBTYPE", "$AMOUNT"],
        "notes": [
          "$AMOUNT represents the number of resources to sell",
          "You can sell up to the total number of RCS you possess, not just one at a time"
        ]
      },
      {
        "name": "GET_GOALS_STATUS",
        "type": "EXECUTE_READ",
        "contract": "$PVP_SYSTEM",
        "entrypoint": "get_goals_status",
        "calldata": ["$TOKEN_ID_LOW", 2],
        "returns": ["IS_GOAL_1_VALIDATED", "IS_GOAL_2_VALIDATED", "IS_GOAL_3_VALIDATED"]
      },
      {
        "name": "VALIDATE_GOAL",
        "type": "EXECUTE_TRANSACTION",
        "contract": "$PVP_SYSTEM",
        "entrypoint": "validate_goal",
        "calldata": ["$TOKEN_ID_LOW", 2, "$GOAL_NUMBER"],
        "notes": [
          "$GOAL_NUMBER represents the index of the goal to validate: 1) Accumulate 50 gold, 2) Gather 50 Pine, 3) Gather 50 Berries"
        ]
      }
    ],
    "queries": [
      {
        "name": "CHECK_MINING",
        "type": "GRAPHQL_FETCH",
        "query": "query { zidleMinerModels(where: { token_id: $TOKEN_ID_LOW, timestampGT: \"0\" }) { totalCount edges { node { resource_type } } } }",
        "interpretation": [
          "If totalCount is 0: The character is not currently mining; a new mine can be started.",
          "If totalCount is greater than 0: The character is already mining; HARVEST_RCS must be executed to finalize mining and update XP."
        ],
        "notes": [
          "CRITICAL: Replace $TOKEN_ID_LOW with the real TOKEN_ID_LOW value from the CHECK_NFT result."
        ],
        "example": {
          "query": "query { zidleMinerModels(where: { token_id: \"0x1234\", timestampGT: \"0\" }) { totalCount edges { node { resource_type } } } }"
        }
      },
      {
        "name": "CHECK_XP",
        "type": "GRAPHQL_FETCH",
        "query": "query { zidleMinerModels(where: { token_id: $TOKEN_ID_LOW }) { totalCount edges { node { resource_type xp } } } }",
        "interpretation": [
          "If totalCount is 0: The character has 0 XP in all resources.",
          "If totalCount is greater than 0: The edges array shows the XP for each resource_type; use this to choose the correct tier for MINE_RCS."
        ],
        "notes": [
          "CRITICAL: Replace $TOKEN_ID_LOW with the real TOKEN_ID_LOW value from CHECK_NFT."
        ],
        "example": {
          "query": "query { zidleMinerModels(where: { token_id: \"0x1234\" }) { totalCount edges { node { resource_type xp } } } }"
        }
      },
      {
        "name": "GET_RCS_BALANCE",
        "type": "GRAPHQL_FETCH",
        "query": "query { zidleMinerModels(where: { token_id: $TOKEN_ID_LOW }) { edges { node { resource_type rcs_1 rcs_2 rcs_3 rcs_4 rcs_5 rcs_6 rcs_7 } } } }",
        "interpretation": [
          "Each node represents a resource type the character owns.",
          "resource_type corresponds to categories (Wood, Food, Mineral).",
          "rcs_1 to rcs_7 are the specific subtypes and their amounts.",
          "Extract the highest available rcs_X value for each resource_type to determine the total sellable amount."
        ],
        "notes": [
          "Replace $TOKEN_ID_LOW with the correct NFT ID before execution.",
          "Use the highest available rcs_X value in SELL_RCS_FOR_GOLD to optimize sales."
        ]
      }
    ]
  }
}
`;