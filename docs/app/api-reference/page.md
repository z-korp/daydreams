---
title: API Reference
---

# @daydreamsai/core

## Enumerations

### HandlerRole

Defined in:
[types.ts:557](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L557)

Enum defining roles for different types of handlers

#### Enumeration Members

##### ACTION

> **ACTION**: `"action"`

Defined in:
[types.ts:563](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L563)

Handler for executing actions

##### INPUT

> **INPUT**: `"input"`

Defined in:
[types.ts:559](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L559)

Handler for processing inputs

##### OUTPUT

> **OUTPUT**: `"output"`

Defined in:
[types.ts:561](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L561)

Handler for processing outputs

---

### LogLevel

Defined in:
[types.ts:420](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L420)

Enum defining available log levels

#### Enumeration Members

##### DEBUG

> **DEBUG**: `3`

Defined in:
[types.ts:424](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L424)

##### ERROR

> **ERROR**: `0`

Defined in:
[types.ts:421](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L421)

##### INFO

> **INFO**: `2`

Defined in:
[types.ts:423](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L423)

##### TRACE

> **TRACE**: `4`

Defined in:
[types.ts:425](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L425)

##### WARN

> **WARN**: `1`

Defined in:
[types.ts:422](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L422)

## Classes

### EvmChain

Defined in:
[chains/evm.ts:44](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/evm.ts#L44)

Implementation of the IChain interface for Ethereum Virtual Machine (EVM)
compatible chains. Provides methods for reading from and writing to EVM-based
blockchains.

#### Example

```typescript
const evmChain = new EvmChain({
  chainName: "ethereum",
  rpcUrl: process.env.ETH_RPC_URL,
  privateKey: process.env.ETH_PRIVATE_KEY,
  chainId: 1,
});
```

#### Implements

- [`IChain`](globals.md#ichain)

#### Constructors

##### new EvmChain()

> **new EvmChain**(`config`): [`EvmChain`](globals.md#evmchain)

Defined in:
[chains/evm.ts:66](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/evm.ts#L66)

Creates a new EVM chain instance

###### Parameters

###### config

`EvmChainConfig`

Configuration options for the chain connection

###### Returns

[`EvmChain`](globals.md#evmchain)

#### Properties

##### chainId

> **chainId**: `string`

Defined in:
[chains/evm.ts:50](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/evm.ts#L50)

Unique identifier for this chain implementation. Matches the IChain interface.
This could be "ethereum", "polygon", etc.

###### Implementation of

[`IChain`](globals.md#ichain).[`chainId`](globals.md#chainid-3)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in:
[chains/evm.ts:90](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/evm.ts#L90)

Performs a read operation on the blockchain, typically calling a view/pure
contract function that doesn't modify state.

###### Parameters

###### call

`unknown`

The call parameters

###### Returns

`Promise`\<`any`\>

The result of the contract call

###### Throws

Error if the call fails

###### Implementation of

[`IChain`](globals.md#ichain).[`read`](globals.md#read-3)

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in:
[chains/evm.ts:130](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/evm.ts#L130)

Performs a write operation on the blockchain by sending a transaction that
modifies state. Examples include transferring tokens or updating contract
storage.

###### Parameters

###### call

`unknown`

The transaction parameters

###### Returns

`Promise`\<`any`\>

The transaction receipt after confirmation

###### Throws

Error if the transaction fails

###### Implementation of

[`IChain`](globals.md#ichain).[`write`](globals.md#write-3)

---

### Logger

Defined in:
[logger.ts:5](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L5)

#### Constructors

##### new Logger()

> **new Logger**(`config`): [`Logger`](globals.md#logger)

Defined in:
[logger.ts:9](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L9)

###### Parameters

###### config

[`LoggerConfig`](globals.md#loggerconfig)

###### Returns

[`Logger`](globals.md#logger)

#### Methods

##### debug()

> **debug**(`context`, `message`, `data`?): `void`

Defined in:
[logger.ts:39](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L39)

###### Parameters

###### context

`string`

###### message

`string`

###### data?

`any`

###### Returns

`void`

##### error()

> **error**(`context`, `message`, `data`?): `void`

Defined in:
[logger.ts:27](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L27)

###### Parameters

###### context

`string`

###### message

`string`

###### data?

`any`

###### Returns

`void`

##### info()

> **info**(`context`, `message`, `data`?): `void`

Defined in:
[logger.ts:35](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L35)

###### Parameters

###### context

`string`

###### message

`string`

###### data?

`any`

###### Returns

`void`

##### trace()

> **trace**(`context`, `message`, `data`?): `void`

Defined in:
[logger.ts:43](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L43)

###### Parameters

###### context

`string`

###### message

`string`

###### data?

`any`

###### Returns

`void`

##### warn()

> **warn**(`context`, `message`, `data`?): `void`

Defined in:
[logger.ts:31](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/logger.ts#L31)

###### Parameters

###### context

`string`

###### message

`string`

###### data?

`any`

###### Returns

`void`

---

### SolanaChain

Defined in:
[chains/solana.ts:29](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/solana.ts#L29)

#### Implements

- [`IChain`](globals.md#ichain)

#### Constructors

##### new SolanaChain()

> **new SolanaChain**(`config`): [`SolanaChain`](globals.md#solanachain)

Defined in:
[chains/solana.ts:34](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/solana.ts#L34)

###### Parameters

###### config

`SolanaChainConfig`

###### Returns

[`SolanaChain`](globals.md#solanachain)

#### Properties

##### chainId

> **chainId**: `string`

Defined in:
[chains/solana.ts:30](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/solana.ts#L30)

A unique identifier for the chain (e.g., "starknet", "ethereum", "solana", etc.)

###### Implementation of

[`IChain`](globals.md#ichain).[`chainId`](globals.md#chainid-3)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in:
[chains/solana.ts:58](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/solana.ts#L58)

Example "read" method. Because Solana doesn't have a direct "contract read" by
default, we might interpret read calls as:

- "getAccountInfo" or
- "getBalance", or
- "getProgramAccounts"

So let's define a simple structure we can parse to do the relevant read.

read({ type: "getBalance", address: "..." }) read({ type: "getAccountInfo",
address: "..." })

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

###### Implementation of

[`IChain`](globals.md#ichain).[`read`](globals.md#read-3)

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in:
[chains/solana.ts:105](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/solana.ts#L105)

Example "write" method. We'll treat this as "send a Solana transaction." A
typical transaction might have multiple instructions.

We'll define a structure for the `call` param: { instructions:
TransactionInstruction[]; signers?: Keypair[]; } where "instructions" is an
array of instructions you want to execute.

The agent or caller is responsible for constructing those instructions (e.g. for
token transfers or program interactions).

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

###### Implementation of

[`IChain`](globals.md#ichain).[`write`](globals.md#write-3)

---

### StarknetChain

Defined in:
[chains/starknet.ts:28](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/starknet.ts#L28)

Implementation of the IChain interface for interacting with the Starknet L2
blockchain

#### Example

```ts
const starknet = new StarknetChain({
  rpcUrl: process.env.STARKNET_RPC_URL,
  address: process.env.STARKNET_ADDRESS,
  privateKey: process.env.STARKNET_PRIVATE_KEY,
});
```

#### Implements

- [`IChain`](globals.md#ichain)

#### Constructors

##### new StarknetChain()

> **new StarknetChain**(`config`): [`StarknetChain`](globals.md#starknetchain)

Defined in:
[chains/starknet.ts:40](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/starknet.ts#L40)

Creates a new StarknetChain instance

###### Parameters

###### config

`StarknetChainConfig`

Configuration options for the Starknet connection

###### Returns

[`StarknetChain`](globals.md#starknetchain)

#### Properties

##### chainId

> **chainId**: `string` = `"starknet"`

Defined in:
[chains/starknet.ts:30](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/starknet.ts#L30)

Unique identifier for this chain implementation

###### Implementation of

[`IChain`](globals.md#ichain).[`chainId`](globals.md#chainid-3)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in:
[chains/starknet.ts:55](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/starknet.ts#L55)

Performs a read-only call to a Starknet contract

###### Parameters

###### call

`Call`

The contract call parameters

###### Returns

`Promise`\<`any`\>

The result of the contract call

###### Throws

Error if the call fails

###### Implementation of

[`IChain`](globals.md#ichain).[`read`](globals.md#read-3)

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in:
[chains/starknet.ts:72](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/chains/starknet.ts#L72)

Executes a state-changing transaction on Starknet

###### Parameters

###### call

`Call`

The transaction parameters

###### Returns

`Promise`\<`any`\>

The transaction receipt after confirmation

###### Throws

Error if the transaction fails

###### Implementation of

[`IChain`](globals.md#ichain).[`write`](globals.md#write-3)

## Interfaces

### Agent\<Memory, TContext\>

Defined in:
[types.ts:286](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L286)

#### Type Parameters

• **Memory** _extends_ [`WorkingMemory`](globals.md#workingmemory) =
[`WorkingMemory`](globals.md#workingmemory)

• **TContext** _extends_
[`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`, `any`, `any`,
`any`\> = [`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`,
`any`, `any`, `any`\>

#### Properties

##### actions

> **actions**:
> [`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`any`,
> `any`, [`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`Memory`,
> `TContext`\>, [`Agent`](globals.md#agentmemory-tcontext)\<`Memory`,
> `TContext`\>, `any`\>[]

Defined in:
[types.ts:316](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L316)

##### container

> **container**: `Container`

Defined in:
[types.ts:301](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L301)

##### context

> **context**: `TContext`

Defined in:
[types.ts:297](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L297)

##### debugger

> **debugger**: [`Debugger`](globals.md#debugger-2)

Defined in:
[types.ts:299](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L299)

##### emit()

> **emit**: (...`args`) => `void`

Defined in:
[types.ts:325](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L325)

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### evaluator()

> **evaluator**: (`ctx`) => `Promise`\<`void`\>

Defined in:
[types.ts:335](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L335)

###### Parameters

###### ctx

[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`Memory`, `TContext`\>

###### Returns

`Promise`\<`void`\>

##### events

> **events**: `Record`\<`string`, `AnyZodObject`\>

Defined in:
[types.ts:312](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L312)

##### experts

> **experts**: `Record`\<`string`,
> [`ExpertConfig`](globals.md#expertconfigcontext)\<[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`Memory`,
> `TContext`\>\>\>

Defined in:
[types.ts:314](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L314)

##### inputs

> **inputs**: `Record`\<`string`,
> [`InputConfig`](globals.md#inputconfigt-context-tagent)\<`any`,
> [`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`Memory`,
> `TContext`\>, [`AnyAgent`](globals.md#anyagent)\>\>

Defined in:
[types.ts:306](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L306)

##### memory

> **memory**: [`MemoryStore`](globals.md#memorystore)

Defined in:
[types.ts:295](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L295)

##### model

> **model**: `LanguageModelV1`

Defined in:
[types.ts:303](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L303)

##### outputs

> **outputs**: `Record`\<`string`,
> `Omit`\<[`Output`](globals.md#outputschema-context-tagent)\<`any`,
> [`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`Memory`,
> `TContext`\>, [`AnyAgent`](globals.md#anyagent)\>, `"type"`\>\>

Defined in:
[types.ts:307](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L307)

##### reasoningModel?

> `optional` **reasoningModel**: `LanguageModelV1`

Defined in:
[types.ts:304](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L304)

##### run()

> **run**: \<`TContext`\>(`context`, `args`) => `Promise`\<`void`\>

Defined in:
[types.ts:326](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L326)

###### Type Parameters

• **TContext** _extends_
[`Context`](globals.md#contextmemory-args-ctx-exports)\<[`WorkingMemory`](globals.md#workingmemory),
`any`, `any`, `any`\>

###### Parameters

###### context

`TContext`

###### args

`TypeOf`\<`TContext`\[`"schema"`\]\>

###### Returns

`Promise`\<`void`\>

##### send()

> **send**: \<`TContext`\>(`context`, `args`, `input`) => `Promise`\<`void`\>

Defined in:
[types.ts:330](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L330)

###### Type Parameters

• **TContext** _extends_
[`Context`](globals.md#contextmemory-args-ctx-exports)\<[`WorkingMemory`](globals.md#workingmemory),
`any`, `any`, `any`\>

###### Parameters

###### context

`TContext`

###### args

`TypeOf`\<`TContext`\[`"schema"`\]\>

###### input

###### data

`any`

###### type

`string`

###### Returns

`Promise`\<`void`\>

#### Methods

##### start()

> **start**(): `Promise`\<`void`\>

Defined in:
[types.ts:337](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L337)

###### Returns

`Promise`\<`void`\>

##### stop()

> **stop**(): `Promise`\<`void`\>

Defined in:
[types.ts:338](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L338)

###### Returns

`Promise`\<`void`\>

---

### AgentContext\<Memory, TContext\>

Defined in:
[types.ts:268](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L268)

#### Type Parameters

• **Memory** _extends_ [`WorkingMemory`](globals.md#workingmemory) =
[`WorkingMemory`](globals.md#workingmemory)

• **TContext** _extends_
[`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`, `any`, `any`,
`any`\> = [`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`,
`any`, `any`, `any`\>

#### Properties

##### args

> **args**: `TypeOf`\<`TContext`\[`"schema"`\]\>

Defined in:
[types.ts:279](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L279)

##### context

> **context**: `TContext`

Defined in:
[types.ts:278](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L278)

##### ctx

> **ctx**: [`InferContextCtx`](globals.md#infercontextctxtcontext)\<`TContext`\>

Defined in:
[types.ts:280](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L280)

##### id

> **id**: `string`

Defined in:
[types.ts:277](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L277)

##### memory

> **memory**: `Memory`

Defined in:
[types.ts:281](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L281)

---

### IChain

Defined in:
[types.ts:468](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L468)

#### Properties

##### chainId

> **chainId**: `string`

Defined in:
[types.ts:472](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L472)

A unique identifier for the chain (e.g., "starknet", "ethereum", "solana", etc.)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in:
[types.ts:478](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L478)

Read (call) a contract or perform a query on this chain. The `call` parameter
can be chain-specific data.

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in:
[types.ts:483](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L483)

Write (execute a transaction) on this chain, typically requiring signatures,
etc.

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

---

### LogEntry

Defined in:
[types.ts:445](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L445)

Structure of a log entry

#### Properties

##### context

> **context**: `string`

Defined in:
[types.ts:448](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L448)

##### data?

> `optional` **data**: `any`

Defined in:
[types.ts:450](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L450)

##### level

> **level**: [`LogLevel`](globals.md#loglevel)

Defined in:
[types.ts:446](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L446)

##### message

> **message**: `string`

Defined in:
[types.ts:449](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L449)

##### timestamp

> **timestamp**: `Date`

Defined in:
[types.ts:447](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L447)

---

### LoggerConfig

Defined in:
[types.ts:435](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L435)

Configuration options for logging

#### Properties

##### enableColors?

> `optional` **enableColors**: `boolean`

Defined in:
[types.ts:438](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L438)

##### enableTimestamp?

> `optional` **enableTimestamp**: `boolean`

Defined in:
[types.ts:437](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L437)

##### level

> **level**: [`LogLevel`](globals.md#loglevel)

Defined in:
[types.ts:436](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L436)

##### logPath?

> `optional` **logPath**: `string`

Defined in:
[types.ts:440](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L440)

##### logToFile?

> `optional` **logToFile**: `boolean`

Defined in:
[types.ts:439](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L439)

##### logWriter?

> `optional` **logWriter**: [`LogWriter`](globals.md#logwriter-1)

Defined in:
[types.ts:441](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L441)

---

### LogWriter

Defined in:
[types.ts:429](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L429)

Interface for custom log writers

#### Methods

##### init()

> **init**(`logPath`): `void`

Defined in:
[types.ts:430](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L430)

###### Parameters

###### logPath

`string`

###### Returns

`void`

##### write()

> **write**(`data`): `void`

Defined in:
[types.ts:431](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L431)

###### Parameters

###### data

`string`

###### Returns

`void`

---

### MemoryStore

Defined in:
[types.ts:41](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L41)

Interface for storing and retrieving memory data

#### Methods

##### clear()

> **clear**(): `Promise`\<`void`\>

Defined in:
[types.ts:67](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L67)

Removes all data from memory

###### Returns

`Promise`\<`void`\>

##### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in:
[types.ts:62](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L62)

Removes data from memory

###### Parameters

###### key

`string`

Key to remove

###### Returns

`Promise`\<`void`\>

##### get()

> **get**\<`T`\>(`key`): `Promise`\<`null` \| `T`\>

Defined in:
[types.ts:48](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L48)

Retrieves data from memory

###### Type Parameters

• **T**

Type of data to retrieve

###### Parameters

###### key

`string`

Key to lookup

###### Returns

`Promise`\<`null` \| `T`\>

Promise resolving to data or null if not found

##### set()

> **set**\<`T`\>(`key`, `value`): `Promise`\<`void`\>

Defined in:
[types.ts:56](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L56)

Stores data in memory

###### Type Parameters

• **T**

Type of data to store

###### Parameters

###### key

`string`

Key to store under

###### value

`T`

Data to store

###### Returns

`Promise`\<`void`\>

---

### ResearchConfig

Defined in:
[types.ts:460](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L460)

Configuration for research operations

#### Properties

##### breadth

> **breadth**: `number`

Defined in:
[types.ts:462](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L462)

##### depth

> **depth**: `number`

Defined in:
[types.ts:463](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L463)

##### learnings?

> `optional` **learnings**: `string`[]

Defined in:
[types.ts:464](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L464)

##### query

> **query**: `string`

Defined in:
[types.ts:461](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L461)

##### visitedUrls?

> `optional` **visitedUrls**: `string`[]

Defined in:
[types.ts:465](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L465)

---

### ResearchResult

Defined in:
[types.ts:454](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L454)

Results from a research operation

#### Properties

##### learnings

> **learnings**: `string`[]

Defined in:
[types.ts:455](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L455)

##### visitedUrls

> **visitedUrls**: `string`[]

Defined in:
[types.ts:456](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L456)

---

### WorkingMemory

Defined in:
[types.ts:73](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L73)

Represents the working memory state during execution

#### Properties

##### calls

> **calls**: [`ActionCall`](globals.md#actioncalldata)\<`any`\>[]

Defined in:
[types.ts:81](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L81)

List of action calls

##### inputs

> **inputs**: [`InputRef`](globals.md#inputref)[]

Defined in:
[types.ts:75](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L75)

List of input references

##### outputs

> **outputs**: [`OutputRef`](globals.md#outputref)[]

Defined in:
[types.ts:77](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L77)

List of output references

##### results

> **results**: [`ActionResult`](globals.md#actionresultdata)\<`any`\>[]

Defined in:
[types.ts:83](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L83)

List of action results

##### thoughts

> **thoughts**: [`Thought`](globals.md#thought)[]

Defined in:
[types.ts:79](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L79)

List of thought records

## Type Aliases

### Action\<Schema, Result, Context, TAgent, TMemory\>

> **Action**\<`Schema`, `Result`, `Context`, `TAgent`, `TMemory`\>: `object`

Defined in:
[types.ts:93](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L93)

Represents an action that can be executed with typed parameters

#### Type Parameters

• **Schema** _extends_ `z.AnyZodObject` = `z.AnyZodObject`

Zod schema defining parameter types

• **Result** = `any`

Return type of the action

• **Context** = `any`

Context type for the action execution

• **TAgent** _extends_ [`AnyAgent`](globals.md#anyagent) =
[`AnyAgent`](globals.md#anyagent)

• **TMemory** _extends_ [`Memory`](globals.md#memorydata)\<`any`\> =
[`Memory`](globals.md#memorydata)\<`any`\>

#### Type declaration

##### description?

> `optional` **description**: `string`

##### enabled()?

> `optional` **enabled**: (`ctx`) => `boolean`

###### Parameters

###### ctx

`Context` & `object`

###### Returns

`boolean`

##### examples?

> `optional` **examples**: `z.infer`\<`Schema`\>[]

##### handler()

> **handler**: (`call`, `ctx`, `agent`) => `Promise`\<`Result`\>

###### Parameters

###### call

[`ActionCall`](globals.md#actioncalldata)\<`z.infer`\<`Schema`\>\>

###### ctx

`Context` & `object`

###### agent

`TAgent`

###### Returns

`Promise`\<`Result`\>

##### install()?

> `optional` **install**: (`agent`) => `Promise`\<`void`\>

###### Parameters

###### agent

`TAgent`

###### Returns

`Promise`\<`void`\>

##### memory?

> `optional` **memory**: `TMemory`

##### name

> **name**: `string`

##### schema

> **schema**: `Schema`

---

### ActionCall\<Data\>

> **ActionCall**\<`Data`\>: `object`

Defined in:
[types.ts:187](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L187)

Represents a call to an action

#### Type Parameters

• **Data** = `any`

#### Type declaration

##### data

> **data**: `Data`

##### id

> **id**: `string`

##### name

> **name**: `string`

##### ref

> **ref**: `"action_call"`

##### timestamp

> **timestamp**: `number`

---

### ActionResult\<Data\>

> **ActionResult**\<`Data`\>: `object`

Defined in:
[types.ts:196](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L196)

Represents the result of an action execution

#### Type Parameters

• **Data** = `any`

#### Type declaration

##### callId

> **callId**: `string`

##### data

> **data**: `Data`

##### name

> **name**: `string`

##### processed?

> `optional` **processed**: `boolean`

##### ref

> **ref**: `"action_result"`

##### timestamp

> **timestamp**: `number`

---

### AnyAgent

> **AnyAgent**: [`Agent`](globals.md#agentmemory-tcontext)\<`any`, `any`\>

Defined in:
[types.ts:284](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L284)

---

### AnyContext

> **AnyContext**: [`Context`](globals.md#contextmemory-args-ctx-exports)\<`any`,
> `any`, `any`, `any`\>

Defined in:
[types.ts:489](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L489)

Type representing any Context with generic type parameters

---

### AnyPrompt

> **AnyPrompt**: [`Prompt`](globals.md#promptdata-variables)\<`any`, `any`\>

Defined in:
[prompt.ts:47](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L47)

---

### Chain

> **Chain**: `object`

Defined in:
[types.ts:27](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L27)

Represents an execution chain with experts and metadata

#### Type declaration

##### experts

> **experts**: `object`[]

List of experts involved in the chain

##### id

> **id**: `string`

Unique identifier for the chain

##### purpose

> **purpose**: `string`

Goal or purpose of this chain

##### thinking

> **thinking**: `string`

Current thinking/reasoning state

---

### Config\<TMemory, TContext\>

> **Config**\<`TMemory`, `TContext`\>: `object`

Defined in:
[types.ts:357](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L357)

#### Type Parameters

• **TMemory** _extends_ [`WorkingMemory`](globals.md#workingmemory) =
[`WorkingMemory`](globals.md#workingmemory)

• **TContext** _extends_ [`AnyContext`](globals.md#anycontext) =
[`AnyContext`](globals.md#anycontext)

#### Type declaration

##### actions?

> `optional` **actions**:
> [`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`any`,
> `any`, [`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`TMemory`,
> `TContext`\>, [`Agent`](globals.md#agentmemory-tcontext)\<`TMemory`,
> `TContext`\>, `any`\>[]

##### container?

> `optional` **container**: `Container`

##### context?

> `optional` **context**: `TContext`

##### debugger?

> `optional` **debugger**: [`Debugger`](globals.md#debugger-2)

##### events?

> `optional` **events**: `Record`\<`string`, `z.AnyZodObject`\>

##### experts?

> `optional` **experts**: `Record`\<`string`,
> [`ExpertConfig`](globals.md#expertconfigcontext)\<[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`TMemory`,
> `TContext`\>\>\>

##### inputs?

> `optional` **inputs**: `Record`\<`string`,
> [`InputConfig`](globals.md#inputconfigt-context-tagent)\<`any`,
> [`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`TMemory`,
> `TContext`\>, [`Agent`](globals.md#agentmemory-tcontext)\<`TMemory`,
> `TContext`\>\>\>

##### logger?

> `optional` **logger**: [`LogLevel`](globals.md#loglevel)

##### memory

> **memory**: [`MemoryStore`](globals.md#memorystore)

##### model

> **model**: `LanguageModelV1`

##### outputs?

> `optional` **outputs**: `Record`\<`string`,
> [`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`any`,
> [`AgentContext`](globals.md#agentcontextmemory-tcontext)\<`TMemory`,
> `TContext`\>, [`Agent`](globals.md#agentmemory-tcontext)\<`TMemory`,
> `TContext`\>\>\>

##### reasoningModel?

> `optional` **reasoningModel**: `LanguageModelV1`

##### services?

> `optional` **services**: `ServiceProvider`[]

---

### Context\<Memory, Args, Ctx, Exports\>

> **Context**\<`Memory`, `Args`, `Ctx`, `Exports`\>: `object`

Defined in:
[types.ts:512](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L512)

Configuration for a context that manages state and behavior

#### Type Parameters

• **Memory** _extends_ [`WorkingMemory`](globals.md#workingmemory) =
[`WorkingMemory`](globals.md#workingmemory)

Type of working memory for this context

• **Args** _extends_ `z.ZodTypeAny` = `never`

Zod schema type for context arguments

• **Ctx** = `any`

Type of context data

• **Exports** = `any`

Type of exported data

#### Type declaration

##### create()?

> `optional` **create**: (`params`, `ctx`) => `Memory`

Optional function to create new memory for this context

###### Parameters

###### params

###### args

`z.infer`\<`Args`\>

###### key

`string`

###### ctx

`Ctx`

###### Returns

`Memory`

##### description?

> `optional` **description**: `string`

Optional description of this context

##### instructions?

> `optional` **instructions**: [`Instruction`](globals.md#instruction) \|
> (`params`, `ctx`) => [`Instruction`](globals.md#instruction)

Optional instructions for this context

##### key()

> **key**: (`args`) => `string`

Function to generate a unique key from context arguments

###### Parameters

###### args

`z.infer`\<`Args`\>

###### Returns

`string`

##### load()?

> `optional` **load**: (`params`, `ctx`) => `Promise`\<`Memory`\>

Optional function to load existing memory

###### Parameters

###### params

###### args

`z.infer`\<`Args`\>

###### key

`string`

###### ctx

`Ctx`

###### Returns

`Promise`\<`Memory`\>

##### render()?

> `optional` **render**: (`memory`, `ctx`) => `string` \| `string`[]

Optional function to render memory state as string(s)

###### Parameters

###### memory

`Memory`

###### ctx

`Ctx`

###### Returns

`string` \| `string`[]

##### save()?

> `optional` **save**: (`params`, `ctx`) => `Promise`\<`void`\>

Optional function to save memory state

###### Parameters

###### params

###### args

`z.infer`\<`Args`\>

###### key

`string`

###### memory

`Memory`

###### ctx

`Ctx`

###### Returns

`Promise`\<`void`\>

##### schema

> **schema**: `Args`

Zod schema for validating context arguments

##### setup()

> **setup**: (`args`, `agent`) => `Promise`\<`Ctx`\> \| `Ctx`

Setup function to initialize context data

###### Parameters

###### args

`z.infer`\<`Args`\>

###### agent

[`AnyAgent`](globals.md#anyagent)

###### Returns

`Promise`\<`Ctx`\> \| `Ctx`

##### type

> **type**: `string`

Unique type identifier for this context

---

### COTProps

> **COTProps**: `object`

Defined in:
[types.ts:215](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L215)

Properties required for Chain-of-Thought execution

#### Type declaration

##### actions

> **actions**:
> [`Action`](globals.md#actionschema-result-context-tagent-tmemory)[]

##### inputs

> **inputs**: [`InputRef`](globals.md#inputref)[]

##### logs

> **logs**: [`Log`](globals.md#log)[]

##### model

> **model**: `LanguageModelV1`

##### outputs

> **outputs**: [`Output`](globals.md#outputschema-context-tagent)[]

##### plan

> **plan**: `string`

---

### COTResponse

> **COTResponse**: `object`

Defined in:
[types.ts:225](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L225)

Response structure from Chain-of-Thought execution

#### Type declaration

##### actions

> **actions**: [`ActionCall`](globals.md#actioncalldata)[]

##### outputs

> **outputs**: [`OutputRef`](globals.md#outputref)[]

##### plan

> **plan**: `string`[]

##### thinking

> **thinking**: [`Thought`](globals.md#thought)[]

---

### Debugger()

> **Debugger**: (`contextId`, `keys`, `data`) => `void`

Defined in:
[types.ts:355](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L355)

#### Parameters

##### contextId

`string`

##### keys

`string`[]

##### data

`any`

#### Returns

`void`

---

### ElementNode\<Attributes\>

> **ElementNode**\<`Attributes`\>: `object`

Defined in:
[xml.ts:67](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L67)

#### Type Parameters

• **Attributes** _extends_ `Record`\<`string`, `string`\> = `Record`\<`string`,
`any`\>

#### Type declaration

##### attributes

> **attributes**: `Attributes`

##### children?

> `optional` **children**: [`Node`](globals.md#node)[]

##### closed?

> `optional` **closed**: `true`

##### content

> **content**: `string`

##### name

> **name**: `string`

##### parent?

> `optional` **parent**: [`Node`](globals.md#node)

##### type

> **type**: `"element"`

---

### Expert\<Context\>

> **Expert**\<`Context`\>: `object`

Defined in:
[types.ts:260](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L260)

Represents an expert system with instructions and actions

#### Type Parameters

• **Context** = `any`

#### Type declaration

##### actions?

> `optional` **actions**:
> [`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`any`,
> `any`, `Context`\>[]

##### description

> **description**: `string`

##### instructions

> **instructions**: `string`

##### model?

> `optional` **model**: `LanguageModelV1`

##### type

> **type**: `string`

---

### ExpertConfig\<Context\>

> **ExpertConfig**\<`Context`\>:
> `Omit`\<[`Expert`](globals.md#expertcontext)\<`Context`\>, `"type"`\>

Defined in:
[types.ts:414](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L414)

Configuration type for experts without type field

#### Type Parameters

• **Context** = `any`

---

### ExtractTemplateVariables\<T\>

> **ExtractTemplateVariables**\<`T`\>: `T` _extends_
> `` `${infer Start}{{${infer Var}}}${infer Rest}` `` ? `Var` \|
> [`ExtractTemplateVariables`](globals.md#extracttemplatevariablest)\<`Rest`\> :
> `never`

Defined in:
[types.ts:246](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L246)

Extracts variable names from a template string

#### Type Parameters

• **T** _extends_ `string`

Template string type

---

### Formatter()\<Variables, Data\>

> **Formatter**\<`Variables`, `Data`\>: (`data`) => `Record`\<keyof `Variables`,
> `any`\>

Defined in:
[prompt.ts:8](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L8)

#### Type Parameters

• **Variables** _extends_ `Record`\<`string`, `any`\> = `Record`\<`string`,
`any`\>

• **Data** = `any`

#### Parameters

##### data

`Data`

#### Returns

`Record`\<keyof `Variables`, `any`\>

---

### GeneratePromptConfig\<TPrompt, Variables, Data, TFormatter\>

> **GeneratePromptConfig**\<`TPrompt`, `Variables`, `Data`, `TFormatter`\>:
> `object`

Defined in:
[prompt.ts:55](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L55)

#### Type Parameters

• **TPrompt** _extends_ [`AnyPrompt`](globals.md#anyprompt) \| `string` = `any`

• **Variables** _extends_ `Record`\<`string`, `any`\> = `any`

• **Data** = `Record`\<`string`, `any`\>

• **TFormatter** _extends_
[`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\> =
[`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\>

#### Type declaration

##### data

> **data**: `Data`

##### formatter?

> `optional` **formatter**: `TFormatter`

##### template

> **template**: `TPrompt`

##### variables

> **variables**: `Variables`

---

### GetVisitors\<Output, T\>

> **GetVisitors**\<`Output`, `T`\>:
> `{ [K in keyof T]?: PromptVisitor<Output, T[K]> }` & `object`

Defined in:
[prompt.ts:27](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L27)

#### Type Parameters

• **Output** = `any`

• **T** _extends_ `Record`\<`string`, `Record`\<`string`, `any`\>\> =
`Record`\<`string`, `Record`\<`string`, `any`\>\>

---

### InferContextCtx\<TContext\>

> **InferContextCtx**\<`TContext`\>: `TContext` _extends_
> [`Context`](globals.md#contextmemory-args-ctx-exports)\<`any`, `any`, infer
> Ctx\> ? `Ctx` : `never`

Defined in:
[types.ts:502](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L502)

Extracts the Context type from a Context type

#### Type Parameters

• **TContext** _extends_ [`AnyContext`](globals.md#anycontext)

The Context type to extract Ctx from

---

### InferContextMemory\<TContext\>

> **InferContextMemory**\<`TContext`\>: `TContext` _extends_
> [`Context`](globals.md#contextmemory-args-ctx-exports)\<infer Memory\> ?
> `Memory` : `never`

Defined in:
[types.ts:495](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L495)

Extracts the Memory type from a Context type

#### Type Parameters

• **TContext** _extends_ [`AnyContext`](globals.md#anycontext)

The Context type to extract Memory from

---

### InferFormatter\<TPrompt\>

> **InferFormatter**\<`TPrompt`\>: `TPrompt` _extends_
> [`Prompt`](globals.md#promptdata-variables)\<infer Data, infer Variables\> ?
> [`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\> :
> `never`

Defined in:
[prompt.ts:13](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L13)

#### Type Parameters

• **TPrompt** _extends_ [`AnyPrompt`](globals.md#anyprompt)

---

### InferGeneratePromptConfig\<TPrompt\>

> **InferGeneratePromptConfig**\<`TPrompt`\>: `TPrompt` _extends_
> [`Prompt`](globals.md#promptdata-variables)\<infer Data, infer Variables\> ?
> [`GeneratePromptConfig`](globals.md#generatepromptconfigtprompt-variables-data-tformatter)\<`TPrompt`,
> `Variables`, `Data`\> : `never` \| `TPrompt` _extends_ `string` ?
> [`GeneratePromptConfig`](globals.md#generatepromptconfigtprompt-variables-data-tformatter)\<`TPrompt`,
> [`TemplateVariables`](globals.md#templatevariablest)\<`TPrompt`\>\> : `never`

Defined in:
[prompt.ts:67](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L67)

#### Type Parameters

• **TPrompt** _extends_ [`AnyPrompt`](globals.md#anyprompt) \| `string`

---

### InferMemoryData\<TMemory\>

> **InferMemoryData**\<`TMemory`\>: `TMemory` _extends_
> [`Memory`](globals.md#memorydata)\<infer Data\> ? `Data` : `never`

Defined in:
[types.ts:21](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L21)

Extracts the data type from a Memory type

#### Type Parameters

• **TMemory** _extends_ [`Memory`](globals.md#memorydata)\<`any`\>

Memory type to extract data from

---

### InferPromptComponents\<TPrompt\>

> **InferPromptComponents**\<`TPrompt`\>: `TPrompt` _extends_
> [`Prompt`](globals.md#promptdata-variables)\<`any`, infer Components\> ?
> `Components` : `never`

Defined in:
[prompt.ts:75](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L75)

#### Type Parameters

• **TPrompt** _extends_ [`AnyPrompt`](globals.md#anyprompt) \| `string`

---

### InferPromptData\<TPrompt\>

> **InferPromptData**\<`TPrompt`\>: `TPrompt` _extends_
> [`Prompt`](globals.md#promptdata-variables)\<infer Data\> ? `Data` : `never`

Defined in:
[prompt.ts:52](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L52)

#### Type Parameters

• **TPrompt** _extends_ [`AnyPrompt`](globals.md#anyprompt)

---

### InferPromptVariables\<TPrompt\>

> **InferPromptVariables**\<`TPrompt`\>: `TPrompt` _extends_
> [`Prompt`](globals.md#promptdata-variables)\<`any`, infer Vars\> ? `Vars` :
> `never`

Defined in:
[prompt.ts:49](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L49)

#### Type Parameters

• **TPrompt** _extends_ [`AnyPrompt`](globals.md#anyprompt)

---

### Input\<Schema, Context, TAgent\>

> **Input**\<`Schema`, `Context`, `TAgent`\>: `object`

Defined in:
[types.ts:140](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L140)

Represents an input handler with validation and subscription capability

#### Type Parameters

• **Schema** _extends_ `z.AnyZodObject` = `z.AnyZodObject`

Zod schema for input parameters

• **Context** _extends_
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\> =
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\>

Context type for input handling

• **TAgent** _extends_ [`AnyAgent`](globals.md#anyagent) =
[`AnyAgent`](globals.md#anyagent)

#### Type declaration

##### description?

> `optional` **description**: `string`

##### handler()

> **handler**: (`params`, `ctx`, `agent`) => `Promise`\<`boolean`\> \| `boolean`

###### Parameters

###### params

`z.infer`\<`Schema`\>

###### ctx

`Context`

###### agent

`TAgent`

###### Returns

`Promise`\<`boolean`\> \| `boolean`

##### install()?

> `optional` **install**: (`agent`) => `Promise`\<`void`\>

###### Parameters

###### agent

`TAgent`

###### Returns

`Promise`\<`void`\>

##### schema

> **schema**: `Schema`

##### subscribe()?

> `optional` **subscribe**: (`send`, `agent`) => () => `void` \| `void` \|
> `Promise`\<`void`\>

###### Parameters

###### send

\<`TContext`\>(`contextHandler`, `args`, `data`) => `void`

###### agent

`TAgent`

###### Returns

() => `void` \| `void` \| `Promise`\<`void`\>

##### type

> **type**: `string`

---

### InputConfig\<T, Context, TAgent\>

> **InputConfig**\<`T`, `Context`, `TAgent`\>:
> `Omit`\<[`Input`](globals.md#inputschema-context-tagent)\<`T`, `Context`,
> `TAgent`\>, `"type"`\>

Defined in:
[types.ts:394](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L394)

Configuration type for inputs without type field

#### Type Parameters

• **T** _extends_ `z.AnyZodObject` = `z.AnyZodObject`

• **Context** _extends_
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\> =
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\>

• **TAgent** _extends_ [`AnyAgent`](globals.md#anyagent) =
[`AnyAgent`](globals.md#anyagent)

---

### InputRef

> **InputRef**: `object`

Defined in:
[types.ts:168](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L168)

Reference to an input event in the system

#### Type declaration

##### data

> **data**: `any`

##### params?

> `optional` **params**: `Record`\<`string`, `string`\>

##### processed?

> `optional` **processed**: `boolean`

##### ref

> **ref**: `"input"`

##### timestamp

> **timestamp**: `number`

##### type

> **type**: `string`

---

### Instruction

> **Instruction**: `string` \| `string`[]

Defined in:
[types.ts:486](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L486)

Type representing instructions that can be either a single string or array of
strings

---

### Log

> **Log**: [`InputRef`](globals.md#inputref) \|
> [`OutputRef`](globals.md#outputref) \| [`Thought`](globals.md#thought) \|
> [`ActionCall`](globals.md#actioncalldata) \|
> [`ActionResult`](globals.md#actionresultdata)

Defined in:
[types.ts:212](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L212)

---

### Memory\<Data\>

> **Memory**\<`Data`\>: `object`

Defined in:
[types.ts:10](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L10)

Represents a memory configuration for storing data

#### Type Parameters

• **Data** = `any`

Type of data stored in memory

#### Type declaration

##### create()

> **create**: () => `Promise`\<`Data`\> \| `Data`

Function to initialize memory data

###### Returns

`Promise`\<`Data`\> \| `Data`

##### key

> **key**: `string`

Unique identifier for this memory

---

### Node

> **Node**: [`TextNode`](globals.md#textnode) \|
> [`ElementNode`](globals.md#elementnodeattributes)

Defined in:
[xml.ts:79](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L79)

---

### NodeVisitor()

> **NodeVisitor**: (`node`, `parse`) => [`Node`](globals.md#node)

Defined in:
[xml.ts:81](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L81)

#### Parameters

##### node

[`Node`](globals.md#node)

##### parse

() => [`Node`](globals.md#node)[]

#### Returns

[`Node`](globals.md#node)

---

### Output\<Schema, Context, TAgent\>

> **Output**\<`Schema`, `Context`, `TAgent`\>: `object`

Defined in:
[types.ts:116](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L116)

#### Type Parameters

• **Schema** _extends_ [`OutputSchema`](globals.md#outputschema) =
[`OutputSchema`](globals.md#outputschema)

• **Context** = `any`

• **TAgent** _extends_ [`AnyAgent`](globals.md#anyagent) =
[`AnyAgent`](globals.md#anyagent)

#### Type declaration

##### description?

> `optional` **description**: `string`

##### enabled()?

> `optional` **enabled**: (`ctx`) => `boolean`

###### Parameters

###### ctx

`Context`

###### Returns

`boolean`

##### examples?

> `optional` **examples**: `z.infer`\<`Schema`\>[]

##### handler()

> **handler**: (`params`, `ctx`, `agent`) => `Promise`\<`boolean`\> \| `boolean`

###### Parameters

###### params

`z.infer`\<`Schema`\>

###### ctx

`Context`

###### agent

`TAgent`

###### Returns

`Promise`\<`boolean`\> \| `boolean`

##### install()?

> `optional` **install**: (`agent`) => `Promise`\<`void`\>

###### Parameters

###### agent

`TAgent`

###### Returns

`Promise`\<`void`\>

##### instructions?

> `optional` **instructions**: `string`

##### schema

> **schema**: `Schema`

##### type

> **type**: `string`

---

### OutputConfig\<T, Context, TAgent\>

> **OutputConfig**\<`T`, `Context`, `TAgent`\>:
> `Omit`\<[`Output`](globals.md#outputschema-context-tagent)\<`T`, `Context`,
> `TAgent`\>, `"type"`\>

Defined in:
[types.ts:404](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L404)

Configuration type for outputs without type field

#### Type Parameters

• **T** _extends_ [`OutputSchema`](globals.md#outputschema) =
[`OutputSchema`](globals.md#outputschema)

• **Context** _extends_
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\> =
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\>

• **TAgent** _extends_ [`AnyAgent`](globals.md#anyagent) =
[`AnyAgent`](globals.md#anyagent)

---

### OutputRef

> **OutputRef**: `object`

Defined in:
[types.ts:178](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L178)

Reference to an output event in the system

#### Type declaration

##### data

> **data**: `any`

##### params?

> `optional` **params**: `Record`\<`string`, `string`\>

##### ref

> **ref**: `"output"`

##### timestamp

> **timestamp**: `number`

##### type

> **type**: `string`

---

### OutputSchema

> **OutputSchema**: `z.AnyZodObject` \| `z.ZodString`

Defined in:
[types.ts:114](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L114)

---

### Parser()\<Output\>

> **Parser**\<`Output`\>: (`content`) => `Output`

Defined in:
[prompt.ts:102](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L102)

#### Type Parameters

• **Output**

#### Parameters

##### content

`string`

#### Returns

`Output`

---

### Pretty\<type\>

> **Pretty**\<`type`\>: `{ [key in keyof type]: type[key] }` & `unknown`

Defined in:
[types.ts:240](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L240)

Utility type to preserve type information

#### Type Parameters

• **type**

---

### Prompt()\<Data, Variables\>

> **Prompt**\<`Data`, `Variables`\>: \<`TData`\>(`data`, `formatter`?) =>
> `string`

Defined in:
[prompt.ts:39](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L39)

#### Type Parameters

• **Data** = `any`

• **Variables** _extends_ `Record`\<`string`, `any`\> = `Record`\<`string`,
`any`\>

#### Type Parameters

• **TData** _extends_ `Data`

#### Parameters

##### data

`TData`

##### formatter?

[`Formatter`](globals.md#formattervariables-data)\<`Variables`, `TData`\>

#### Returns

`string`

---

### PromptVisitor()\<Output, Attributes\>

> **PromptVisitor**\<`Output`, `Attributes`\>: (`output`, `node`, `parse`) =>
> `void`

Defined in:
[prompt.ts:18](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L18)

#### Type Parameters

• **Output** = `any`

• **Attributes** _extends_ `Record`\<`string`, `any`\> = `Record`\<`string`,
`any`\>

#### Parameters

##### output

`Output`

##### node

[`ElementNode`](globals.md#elementnodeattributes)\<`Attributes`\>

##### parse

() => [`Node`](globals.md#node)[]

#### Returns

`void`

---

### Subscription()

> **Subscription**: () => `void`

Defined in:
[types.ts:417](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L417)

Function type for subscription cleanup

#### Returns

`void`

---

### Task()\<Params, Result\>

> **Task**\<`Params`, `Result`\>: (`params`, `options`?) =>
> `Promise`\<`Result`\>

Defined in:
[task.ts:15](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/task.ts#L15)

#### Type Parameters

• **Params**

• **Result**

#### Parameters

##### params

`Params`

##### options?

[`TaskOptions`](globals.md#taskoptions)

#### Returns

`Promise`\<`Result`\>

---

### TaskContext

> **TaskContext**: `object`

Defined in:
[task.ts:10](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/task.ts#L10)

#### Type declaration

##### callId

> **callId**: `string`

##### debug

> **debug**: [`Debugger`](globals.md#debugger-2)

---

### TaskOptions

> **TaskOptions**: `object`

Defined in:
[task.ts:4](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/task.ts#L4)

#### Type declaration

##### debug?

> `optional` **debug**: [`Debugger`](globals.md#debugger-2)

##### limit?

> `optional` **limit**: `number`

##### retry?

> `optional` **retry**: `number`

---

### TemplateVariables\<T\>

> **TemplateVariables**\<`T`\>: [`Pretty`](globals.md#prettytype)\<\{ \[K in
> ExtractTemplateVariables\<T\>\]: string \| string\[\] \| object \}\>

Defined in:
[types.ts:255](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L255)

Creates a type mapping template variables to string values

#### Type Parameters

• **T** _extends_ `string`

Template string type

---

### TextNode

> **TextNode**: `object`

Defined in:
[xml.ts:60](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L60)

#### Type declaration

##### children?

> `optional` **children**: `never`

##### content

> **content**: `string`

##### parent?

> `optional` **parent**: [`Node`](globals.md#node)

##### type

> **type**: `"text"`

---

### Thought

> **Thought**: `object`

Defined in:
[types.ts:206](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L206)

Represents a thought or reasoning step

#### Type declaration

##### content

> **content**: `string`

##### ref

> **ref**: `"thought"`

##### timestamp

> **timestamp**: `number`

---

### XMLElement

> **XMLElement**: `object`

Defined in:
[types.ts:233](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/types.ts#L233)

Represents an XML element structure

#### Type declaration

##### content

> **content**: `string` \| ([`XMLElement`](globals.md#xmlelement) \| `string`)[]

##### params?

> `optional` **params**: `Record`\<`string`, `string`\>

##### tag

> **tag**: `string`

## Variables

### defaultContext

> `const` **defaultContext**:
> [`Context`](globals.md#contextmemory-args-ctx-exports)\<[`WorkingMemory`](globals.md#workingmemory),
> `ZodString`, \{\}, `any`\>

Defined in:
[memory.ts:46](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/memory.ts#L46)

## Functions

### action()

> **action**\<`Schema`, `Result`, `Context`, `TAgent`, `TMemory`\>(`action`):
> [`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`Schema`,
> `Result`, `Context`, `TAgent`, `TMemory`\>

Defined in:
[utils.ts:72](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L72)

Creates an action configuration

#### Type Parameters

• **Schema** _extends_ `AnyZodObject` = `AnyZodObject`

Zod schema type for action parameters

• **Result** = `any`

Return type of the action

• **Context** _extends_
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\> =
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\>

Context type for action execution

• **TAgent** _extends_ [`Agent`](globals.md#agentmemory-tcontext)\<`any`,
`any`\> = [`Agent`](globals.md#agentmemory-tcontext)\<`any`, `any`\>

• **TMemory** _extends_ [`Memory`](globals.md#memorydata)\<`any`\> = `never`

#### Parameters

##### action

[`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`Schema`,
`Result`, `Context`, `TAgent`, `TMemory`\>

Action configuration object

#### Returns

[`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`Schema`,
`Result`, `Context`, `TAgent`, `TMemory`\>

Typed action configuration

---

### context()

> **context**\<`Memory`, `Args`, `Ctx`, `Exports`\>(`ctx`):
> [`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`, `Args`,
> `Ctx`, `Exports`\>

Defined in:
[utils.ts:164](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L164)

Creates a context configuration

#### Type Parameters

• **Memory** _extends_ [`WorkingMemory`](globals.md#workingmemory) =
[`WorkingMemory`](globals.md#workingmemory)

Type of working memory

• **Args** _extends_ `ZodTypeAny` = `any`

Zod schema type for context arguments

• **Ctx** = `any`

Type of context data

• **Exports** = `any`

Type of exported data

#### Parameters

##### ctx

[`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`, `Args`, `Ctx`,
`Exports`\>

Context configuration object

#### Returns

[`Context`](globals.md#contextmemory-args-ctx-exports)\<`Memory`, `Args`, `Ctx`,
`Exports`\>

Typed context configuration

---

### createContextHandler()

> **createContextHandler**\<`T`\>(`memoryCreator`, `renderContext`): (`memory`)
> => `object`

Defined in:
[memory.ts:6](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/memory.ts#L6)

#### Type Parameters

• **T**

#### Parameters

##### memoryCreator

(`contextId`) => `T`

##### renderContext

(`context`) => `string` \| `string`[]

#### Returns

`Function`

##### Parameters

###### memory

[`MemoryStore`](globals.md#memorystore)

##### Returns

`object`

###### get()

> **get**: (`contextId`) => `Promise`\<\{ `id`: `string`; `memory`: `T`; \}\>

###### Parameters

###### contextId

`string`

###### Returns

`Promise`\<\{ `id`: `string`; `memory`: `T`; \}\>

###### render()

> **render**: (`context`) => `string` \| `string`[] = `renderContext`

###### Parameters

###### context

`T`

###### Returns

`string` \| `string`[]

###### save()

> **save**: (`contextId`, `data`) => `Promise`\<`void`\>

###### Parameters

###### contextId

`string`

###### data

`T`

###### Returns

`Promise`\<`void`\>

---

### createDreams()

> **createDreams**\<`Memory`, `TContext`\>(`config`):
> [`Agent`](globals.md#agentmemory-tcontext)\<`Memory`, `TContext`\>

Defined in:
[dreams.ts:272](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/dreams.ts#L272)

#### Type Parameters

• **Memory** _extends_ [`WorkingMemory`](globals.md#workingmemory) =
[`WorkingMemory`](globals.md#workingmemory)

• **TContext** _extends_ [`AnyContext`](globals.md#anycontext) =
[`AnyContext`](globals.md#anycontext)

#### Parameters

##### config

[`Config`](globals.md#configtmemory-tcontext)\<`Memory`, `TContext`\>

#### Returns

[`Agent`](globals.md#agentmemory-tcontext)\<`Memory`, `TContext`\>

---

### createMemoryStore()

> **createMemoryStore**(): [`MemoryStore`](globals.md#memorystore)

Defined in:
[memory.ts:60](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/memory.ts#L60)

#### Returns

[`MemoryStore`](globals.md#memorystore)

---

### createParser()

> **createParser**\<`Output`, `Components`, `Visitors`\>(`getOutput`,
> `visitors`): [`Parser`](globals.md#parseroutput)\<`Output`\>

Defined in:
[prompt.ts:104](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L104)

#### Type Parameters

• **Output** = `any`

• **Components** _extends_ `Record`\<`string`, `Record`\<`string`, `any`\>\> =
`Record`\<`string`, `Record`\<`string`, `any`\>\>

• **Visitors** _extends_
[`GetVisitors`](globals.md#getvisitorsoutput-t)\<`Output`, `Components`\> =
[`GetVisitors`](globals.md#getvisitorsoutput-t)\<`Output`, `Components`\>

#### Parameters

##### getOutput

() => `Output`

##### visitors

`Visitors`

#### Returns

[`Parser`](globals.md#parseroutput)\<`Output`\>

---

### createPrompt()

> **createPrompt**\<`Data`, `Template`, `Variables`\>(`prompt`, `formatter`):
> [`Prompt`](globals.md#promptdata-variables)\<`Data`, `Variables`\>

Defined in:
[prompt.ts:82](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L82)

#### Type Parameters

• **Data** _extends_ `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

• **Template** _extends_ `string` = `string`

• **Variables** _extends_ \{ \[key in string\]: \{ \[K in string\]: string \|
object \| string\[\] \}\[key\] \} = \{ \[key in string\]: \{ \[K in string\]:
string \| object \| string\[\] \}\[key\] \}

#### Parameters

##### prompt

`Template`

##### formatter

[`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\>

#### Returns

[`Prompt`](globals.md#promptdata-variables)\<`Data`, `Variables`\>

---

### createTagParser()

> **createTagParser**\<`T`\>(`tagName`, `contentParser`?): (`content`) =>
> `object`[]

Defined in:
[xml.ts:36](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L36)

#### Type Parameters

• **T** = `string`

#### Parameters

##### tagName

`string`

##### contentParser?

(`content`) => `T`

#### Returns

`Function`

##### Parameters

###### content

`string`

##### Returns

`object`[]

---

### createTagRegex()

> **createTagRegex**(`tagName`): `RegExp`

Defined in:
[xml.ts:29](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L29)

Creates a regular expression to match XML tags with a specific name

#### Parameters

##### tagName

`string`

The name of the XML tag to match

#### Returns

`RegExp`

RegExp that matches the specified XML tag and captures its attributes and
content

---

### defaultContextMemory()

> **defaultContextMemory**(): [`WorkingMemory`](globals.md#workingmemory)

Defined in:
[memory.ts:27](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/memory.ts#L27)

#### Returns

[`WorkingMemory`](globals.md#workingmemory)

---

### defaultContextRender()

> **defaultContextRender**(`memory`): `string`[]

Defined in:
[memory.ts:37](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/memory.ts#L37)

#### Parameters

##### memory

[`WorkingMemory`](globals.md#workingmemory)

#### Returns

`string`[]

---

### expert()

> **expert**\<`Context`\>(`config`):
> [`ExpertConfig`](globals.md#expertconfigcontext)\<`Context`\>

Defined in:
[utils.ts:108](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L108)

Creates an expert configuration

#### Type Parameters

• **Context** = `any`

Context type for expert execution

#### Parameters

##### config

[`ExpertConfig`](globals.md#expertconfigcontext)\<`Context`\>

Expert configuration object

#### Returns

[`ExpertConfig`](globals.md#expertconfigcontext)\<`Context`\>

Typed expert configuration

---

### formatAction()

> **formatAction**(`action`): `string`

Defined in:
[formatters.ts:67](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/formatters.ts#L67)

#### Parameters

##### action

[`Action`](globals.md#actionschema-result-context-tagent-tmemory)\<`any`, `any`,
`any`\>

#### Returns

`string`

---

### formatContext()

> **formatContext**(`__namedParameters`): `string`

Defined in:
[formatters.ts:88](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/formatters.ts#L88)

#### Parameters

##### \_\_namedParameters

###### content

`string` \| (`string` \| [`XMLElement`](globals.md#xmlelement))[]

###### description?

`string`

###### instructions?

`string` \| `string`[]

###### key

`string`

###### type

`string`

#### Returns

`string`

---

### formatContextLog()

> **formatContextLog**(`i`): `string`

Defined in:
[formatters.ts:121](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/formatters.ts#L121)

#### Parameters

##### i

[`Log`](globals.md#log)

#### Returns

`string`

---

### formatInput()

> **formatInput**(`input`): `string`

Defined in:
[formatters.ts:18](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/formatters.ts#L18)

Formats an input reference into XML format

#### Parameters

##### input

[`InputRef`](globals.md#inputref)

The input reference to format

#### Returns

`string`

XML string representation of the input

---

### formatOutput()

> **formatOutput**(`output`): `string`

Defined in:
[formatters.ts:32](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/formatters.ts#L32)

Formats an output reference into XML format

#### Parameters

##### output

[`OutputRef`](globals.md#outputref)

The output reference to format

#### Returns

`string`

XML string representation of the output

---

### formatOutputInterface()

> **formatOutputInterface**(`output`): `string`

Defined in:
[formatters.ts:48](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/formatters.ts#L48)

Formats an output interface definition into XML format

#### Parameters

##### output

[`Output`](globals.md#outputschema-context-tagent)

The output interface to format

#### Returns

`string`

XML string representation of the output interface

---

### formatValue()

> **formatValue**(`value`): `string`

Defined in:
[utils.ts:40](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L40)

Formats a value for template rendering

#### Parameters

##### value

`any`

The value to format

#### Returns

`string`

Formatted string representation of the value

---

### formatXml()

> **formatXml**(`__namedParameters`): `string`

Defined in:
[xml.ts:10](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L10)

Formats an XML element into a string representation

#### Parameters

##### \_\_namedParameters

[`XMLElement`](globals.md#xmlelement)

#### Returns

`string`

Formatted XML string

---

### getOrCreateConversationMemory()

> **getOrCreateConversationMemory**(`memory`): `object`

Defined in:
[memory.ts:55](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/memory.ts#L55)

#### Parameters

##### memory

[`MemoryStore`](globals.md#memorystore)

#### Returns

`object`

##### get()

> **get**: (`contextId`) => `Promise`\<\{ `id`: `string`; `memory`:
> [`WorkingMemory`](globals.md#workingmemory); \}\>

###### Parameters

###### contextId

`string`

###### Returns

`Promise`\<\{ `id`: `string`; `memory`:
[`WorkingMemory`](globals.md#workingmemory); \}\>

##### render()

> **render**: (`context`) => `string` \| `string`[] = `renderContext`

###### Parameters

###### context

[`WorkingMemory`](globals.md#workingmemory)

###### Returns

`string` \| `string`[]

##### save()

> **save**: (`contextId`, `data`) => `Promise`\<`void`\>

###### Parameters

###### contextId

`string`

###### data

[`WorkingMemory`](globals.md#workingmemory)

###### Returns

`Promise`\<`void`\>

---

### getZodJsonSchema()

> **getZodJsonSchema**(`schema`): `JsonSchema7Type`

Defined in:
[prompt.ts:78](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/prompt.ts#L78)

#### Parameters

##### schema

`ZodType`\<`any`\>

#### Returns

`JsonSchema7Type`

---

### input()

> **input**\<`Schema`, `Context`, `TAgent`\>(`config`):
> [`InputConfig`](globals.md#inputconfigt-context-tagent)\<`Schema`, `Context`,
> `TAgent`\>

Defined in:
[utils.ts:53](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L53)

Creates an input configuration

#### Type Parameters

• **Schema** _extends_ `AnyZodObject` = `AnyZodObject`

Zod schema type for input validation

• **Context** _extends_
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\> =
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\>

Context type for input handling

• **TAgent** _extends_ [`Agent`](globals.md#agentmemory-tcontext)\<`any`,
`any`\> = [`Agent`](globals.md#agentmemory-tcontext)\<`any`, `any`\>

#### Parameters

##### config

[`InputConfig`](globals.md#inputconfigt-context-tagent)\<`Schema`, `Context`,
`TAgent`\>

Input configuration object

#### Returns

[`InputConfig`](globals.md#inputconfigt-context-tagent)\<`Schema`, `Context`,
`TAgent`\>

Typed input configuration

---

### isElement()

> **isElement**(`node`): `node is ElementNode<Record<string, any>>`

Defined in:
[xml.ts:181](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L181)

#### Parameters

##### node

[`Node`](globals.md#node)

#### Returns

`node is ElementNode<Record<string, any>>`

---

### isText()

> **isText**(`node`): `node is TextNode`

Defined in:
[xml.ts:185](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L185)

#### Parameters

##### node

[`Node`](globals.md#node)

#### Returns

`node is TextNode`

---

### llm()

> **llm**(`__namedParameters`):
> `Promise`\<`GenerateTextResult`\<`Record`\<`string`, `CoreTool`\<`any`,
> `any`\>\>, `never`\>\>

Defined in:
[llm.ts:3](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/llm.ts#L3)

#### Parameters

##### \_\_namedParameters

###### model

`LanguageModelV1`

###### prompt?

`string`

###### stopSequences?

`string`[]

###### system?

`string`

#### Returns

`Promise`\<`GenerateTextResult`\<`Record`\<`string`, `CoreTool`\<`any`,
`any`\>\>, `never`\>\>

---

### memory()

> **memory**\<`Data`\>(`memory`): [`Memory`](globals.md#memorydata)\<`Data`\>

Defined in:
[utils.ts:179](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L179)

Creates a memory configuration

#### Type Parameters

• **Data** = `any`

Type of data stored in memory

#### Parameters

##### memory

[`Memory`](globals.md#memorydata)\<`Data`\>

Memory configuration object

#### Returns

[`Memory`](globals.md#memorydata)\<`Data`\>

Typed memory configuration

---

### output()

> **output**\<`Schema`, `Context`\>(`config`):
> [`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`Schema`,
> `Context`\>

Defined in:
[utils.ts:92](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L92)

Creates an output configuration

#### Type Parameters

• **Schema** _extends_ [`OutputSchema`](globals.md#outputschema) =
[`OutputSchema`](globals.md#outputschema)

Zod schema type for output validation

• **Context** _extends_
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\> =
[`AgentContext`](globals.md#agentcontextmemory-tcontext)\<[`WorkingMemory`](globals.md#workingmemory),
[`AnyContext`](globals.md#anycontext)\>

Context type for output handling

#### Parameters

##### config

[`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`Schema`, `Context`\>

Output configuration object

#### Returns

[`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`Schema`, `Context`\>

Typed output configuration

---

### parse()

> **parse**(`text`, `visitor`, `depth`, `parent`): [`Node`](globals.md#node)[]

Defined in:
[xml.ts:93](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L93)

#### Parameters

##### text

`string`

##### visitor

[`NodeVisitor`](globals.md#nodevisitor)

##### depth

`number` = `0`

##### parent

`undefined` | [`Node`](globals.md#node)

#### Returns

[`Node`](globals.md#node)[]

---

### parseAttributes()

> **parseAttributes**(`text`): `Record`\<`string`, `string`\>

Defined in:
[xml.ts:83](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/xml.ts#L83)

#### Parameters

##### text

`string`

#### Returns

`Record`\<`string`, `string`\>

---

### render()

> **render**\<`Template`\>(`str`, `data`): `string`

Defined in:
[utils.ts:24](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L24)

Renders a template string by replacing variables with provided values

#### Type Parameters

• **Template** _extends_ `string`

The template string type containing variables in {{var}} format

#### Parameters

##### str

`Template`

The template string to render

##### data

\{ \[key in string\]: \{ \[K in string\]: string \| object \| string\[\]
\}\[key\] \}

Object containing values for template variables

#### Returns

`string`

The rendered string with variables replaced

---

### splitTextIntoChunks()

> **splitTextIntoChunks**(`text`, `options`): `string`[]

Defined in:
[utils.ts:125](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/utils.ts#L125)

Splits text into chunks based on maximum chunk size

#### Parameters

##### text

`string`

The text to split into chunks

##### options

`ChunkOptions`

Chunking options including maximum chunk size

#### Returns

`string`[]

Array of text chunks

---

### task()

> **task**\<`Params`, `Result`\>(`key`, `fn`, `defaultOptions`?):
> [`Task`](globals.md#taskparams-result)\<`Params`, `Result`\>

Defined in:
[task.ts:19](https://github.com/dojoengine/daydreams/blob/eb3bea941563a3e64aeaff9e7839c907c71e8359/packages/core/src/core/v1/task.ts#L19)

#### Type Parameters

• **Params**

• **Result**

#### Parameters

##### key

`string`

##### fn

(`params`, `ctx`) => `Promise`\<`Result`\>

##### defaultOptions?

[`TaskOptions`](globals.md#taskoptions)

#### Returns

[`Task`](globals.md#taskparams-result)\<`Params`, `Result`\>
