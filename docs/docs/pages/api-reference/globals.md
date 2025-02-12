# @daydreamsai/core

## Enumerations

### HandlerRole

Defined in: [types.ts:389](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L389)

#### Enumeration Members

##### ACTION

> **ACTION**: `"action"`

Defined in: [types.ts:392](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L392)

##### INPUT

> **INPUT**: `"input"`

Defined in: [types.ts:390](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L390)

##### OUTPUT

> **OUTPUT**: `"output"`

Defined in: [types.ts:391](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L391)

***

### LogLevel

Defined in: [types.ts:323](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L323)

Enum defining available log levels

#### Enumeration Members

##### DEBUG

> **DEBUG**: `3`

Defined in: [types.ts:327](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L327)

##### ERROR

> **ERROR**: `0`

Defined in: [types.ts:324](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L324)

##### INFO

> **INFO**: `2`

Defined in: [types.ts:326](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L326)

##### TRACE

> **TRACE**: `4`

Defined in: [types.ts:328](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L328)

##### WARN

> **WARN**: `1`

Defined in: [types.ts:325](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L325)

## Classes

### EvmChain

Defined in: [chains/evm.ts:44](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/evm.ts#L44)

Implementation of the IChain interface for Ethereum Virtual Machine (EVM) compatible chains.
Provides methods for reading from and writing to EVM-based blockchains.

#### Example

```typescript
const evmChain = new EvmChain({
  chainName: "ethereum",
  rpcUrl: process.env.ETH_RPC_URL,
  privateKey: process.env.ETH_PRIVATE_KEY,
  chainId: 1
});
```

#### Implements

- [`IChain`](globals.md#ichain)

#### Constructors

##### new EvmChain()

> **new EvmChain**(`config`): [`EvmChain`](globals.md#evmchain)

Defined in: [chains/evm.ts:66](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/evm.ts#L66)

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

Defined in: [chains/evm.ts:50](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/evm.ts#L50)

Unique identifier for this chain implementation.
Matches the IChain interface.
This could be "ethereum", "polygon", etc.

###### Implementation of

[`IChain`](globals.md#ichain).[`chainId`](globals.md#chainid-3)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in: [chains/evm.ts:90](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/evm.ts#L90)

Performs a read operation on the blockchain, typically calling a view/pure contract function
that doesn't modify state.

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

Defined in: [chains/evm.ts:130](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/evm.ts#L130)

Performs a write operation on the blockchain by sending a transaction that modifies state.
Examples include transferring tokens or updating contract storage.

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

***

### Logger

Defined in: [logger.ts:5](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L5)

#### Constructors

##### new Logger()

> **new Logger**(`config`): [`Logger`](globals.md#logger)

Defined in: [logger.ts:9](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L9)

###### Parameters

###### config

[`LoggerConfig`](globals.md#loggerconfig)

###### Returns

[`Logger`](globals.md#logger)

#### Methods

##### debug()

> **debug**(`context`, `message`, `data`?): `void`

Defined in: [logger.ts:39](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L39)

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

Defined in: [logger.ts:27](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L27)

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

Defined in: [logger.ts:35](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L35)

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

Defined in: [logger.ts:43](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L43)

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

Defined in: [logger.ts:31](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/logger.ts#L31)

###### Parameters

###### context

`string`

###### message

`string`

###### data?

`any`

###### Returns

`void`

***

### SolanaChain

Defined in: [chains/solana.ts:29](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/solana.ts#L29)

#### Implements

- [`IChain`](globals.md#ichain)

#### Constructors

##### new SolanaChain()

> **new SolanaChain**(`config`): [`SolanaChain`](globals.md#solanachain)

Defined in: [chains/solana.ts:34](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/solana.ts#L34)

###### Parameters

###### config

`SolanaChainConfig`

###### Returns

[`SolanaChain`](globals.md#solanachain)

#### Properties

##### chainId

> **chainId**: `string`

Defined in: [chains/solana.ts:30](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/solana.ts#L30)

A unique identifier for the chain (e.g., "starknet", "ethereum", "solana", etc.)

###### Implementation of

[`IChain`](globals.md#ichain).[`chainId`](globals.md#chainid-3)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in: [chains/solana.ts:58](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/solana.ts#L58)

Example "read" method. Because Solana doesn't have a direct "contract read" by default,
we might interpret read calls as:
 - "getAccountInfo" or
 - "getBalance", or
 - "getProgramAccounts"

So let's define a simple structure we can parse to do the relevant read.

read({ type: "getBalance", address: "..." })
read({ type: "getAccountInfo", address: "..." })

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

###### Implementation of

[`IChain`](globals.md#ichain).[`read`](globals.md#read-3)

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in: [chains/solana.ts:105](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/solana.ts#L105)

Example "write" method. We'll treat this as "send a Solana transaction."
A typical transaction might have multiple instructions.

We'll define a structure for the `call` param:
{
  instructions: TransactionInstruction[];
  signers?: Keypair[];
}
where "instructions" is an array of instructions you want to execute.

The agent or caller is responsible for constructing those instructions (e.g. for
token transfers or program interactions).

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

###### Implementation of

[`IChain`](globals.md#ichain).[`write`](globals.md#write-3)

***

### StarknetChain

Defined in: [chains/starknet.ts:28](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/starknet.ts#L28)

Implementation of the IChain interface for interacting with the Starknet L2 blockchain

#### Example

```ts
const starknet = new StarknetChain({
  rpcUrl: process.env.STARKNET_RPC_URL,
  address: process.env.STARKNET_ADDRESS,
  privateKey: process.env.STARKNET_PRIVATE_KEY
});
```

#### Implements

- [`IChain`](globals.md#ichain)

#### Constructors

##### new StarknetChain()

> **new StarknetChain**(`config`): [`StarknetChain`](globals.md#starknetchain)

Defined in: [chains/starknet.ts:40](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/starknet.ts#L40)

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

Defined in: [chains/starknet.ts:30](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/starknet.ts#L30)

Unique identifier for this chain implementation

###### Implementation of

[`IChain`](globals.md#ichain).[`chainId`](globals.md#chainid-3)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in: [chains/starknet.ts:55](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/starknet.ts#L55)

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

Defined in: [chains/starknet.ts:72](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/chains/starknet.ts#L72)

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

### Agent\<Memory, T\>

Defined in: [types.ts:213](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L213)

#### Type Parameters

• **Memory** *extends* [`WorkingMemory`](globals.md#workingmemory) = [`WorkingMemory`](globals.md#workingmemory)

• **T** *extends* [`ContextHandler`](globals.md#contexthandlert)\<`Memory`\> = [`ContextHandler`](globals.md#contexthandlert)\<`Memory`\>

#### Properties

##### actions

> **actions**: [`Action`](globals.md#actionschema-result-context-tagent)\<`any`, `any`, [`InferContextFromHandler`](globals.md#infercontextfromhandlerthandler)\<`T`\>, [`Agent`](globals.md#agentmemory-t)\<`Memory`, `T`\>\>[]

Defined in: [types.ts:240](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L240)

##### container

> **container**: `Container`

Defined in: [types.ts:225](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L225)

##### context

> **context**: `T`

Defined in: [types.ts:221](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L221)

##### debugger

> **debugger**: [`Debugger`](globals.md#debugger-2)

Defined in: [types.ts:223](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L223)

##### emit()

> **emit**: (...`args`) => `void`

Defined in: [types.ts:243](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L243)

###### Parameters

###### args

...`any`[]

###### Returns

`void`

##### evaluator()

> **evaluator**: (`ctx`) => `Promise`\<`void`\>

Defined in: [types.ts:249](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L249)

###### Parameters

###### ctx

[`InferContextFromHandler`](globals.md#infercontextfromhandlerthandler)\<`T`\>

###### Returns

`Promise`\<`void`\>

##### events

> **events**: `Record`\<`string`, `AnyZodObject`\>

Defined in: [types.ts:236](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L236)

##### experts

> **experts**: `Record`\<`string`, [`ExpertConfig`](globals.md#expertconfigcontext)\<[`InferContextFromHandler`](globals.md#infercontextfromhandlerthandler)\<`T`\>\>\>

Defined in: [types.ts:238](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L238)

##### inputs

> **inputs**: `Record`\<`string`, [`InputConfig`](globals.md#inputconfigt-context-tagent)\<`any`, [`InferContextFromHandler`](globals.md#infercontextfromhandlerthandler)\<`T`\>, [`AnyAgent`](globals.md#anyagent)\>\>

Defined in: [types.ts:230](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L230)

##### memory

> **memory**: [`MemoryStore`](globals.md#memorystore)

Defined in: [types.ts:219](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L219)

##### model

> **model**: `LanguageModelV1`

Defined in: [types.ts:227](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L227)

##### outputs

> **outputs**: `Record`\<`string`, `Omit`\<[`Output`](globals.md#outputschema-context-tagent)\<`any`, [`InferContextFromHandler`](globals.md#infercontextfromhandlerthandler)\<`T`\>, [`AnyAgent`](globals.md#anyagent)\>, `"type"`\>\>

Defined in: [types.ts:231](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L231)

##### reasoningModel?

> `optional` **reasoningModel**: `LanguageModelV1`

Defined in: [types.ts:228](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L228)

##### run()

> **run**: (`conversationId`) => `Promise`\<`void`\>

Defined in: [types.ts:244](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L244)

###### Parameters

###### conversationId

`string`

###### Returns

`Promise`\<`void`\>

##### send()

> **send**: (`conversationId`, `input`) => `Promise`\<`void`\>

Defined in: [types.ts:245](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L245)

###### Parameters

###### conversationId

`string`

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

Defined in: [types.ts:251](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L251)

###### Returns

`Promise`\<`void`\>

##### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [types.ts:252](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L252)

###### Returns

`Promise`\<`void`\>

***

### AgentContext\<Memory\>

Defined in: [types.ts:206](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L206)

#### Type Parameters

• **Memory** *extends* [`WorkingMemory`](globals.md#workingmemory) = [`WorkingMemory`](globals.md#workingmemory)

#### Properties

##### id

> **id**: `string`

Defined in: [types.ts:207](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L207)

##### memory

> **memory**: `Memory`

Defined in: [types.ts:208](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L208)

***

### IChain

Defined in: [types.ts:371](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L371)

#### Properties

##### chainId

> **chainId**: `string`

Defined in: [types.ts:375](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L375)

A unique identifier for the chain (e.g., "starknet", "ethereum", "solana", etc.)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in: [types.ts:381](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L381)

Read (call) a contract or perform a query on this chain.
The `call` parameter can be chain-specific data.

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in: [types.ts:386](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L386)

Write (execute a transaction) on this chain, typically requiring signatures, etc.

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

***

### LogEntry

Defined in: [types.ts:348](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L348)

Structure of a log entry

#### Properties

##### context

> **context**: `string`

Defined in: [types.ts:351](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L351)

##### data?

> `optional` **data**: `any`

Defined in: [types.ts:353](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L353)

##### level

> **level**: [`LogLevel`](globals.md#loglevel)

Defined in: [types.ts:349](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L349)

##### message

> **message**: `string`

Defined in: [types.ts:352](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L352)

##### timestamp

> **timestamp**: `Date`

Defined in: [types.ts:350](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L350)

***

### LoggerConfig

Defined in: [types.ts:338](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L338)

Configuration options for logging

#### Properties

##### enableColors?

> `optional` **enableColors**: `boolean`

Defined in: [types.ts:341](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L341)

##### enableTimestamp?

> `optional` **enableTimestamp**: `boolean`

Defined in: [types.ts:340](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L340)

##### level

> **level**: [`LogLevel`](globals.md#loglevel)

Defined in: [types.ts:339](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L339)

##### logPath?

> `optional` **logPath**: `string`

Defined in: [types.ts:343](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L343)

##### logToFile?

> `optional` **logToFile**: `boolean`

Defined in: [types.ts:342](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L342)

##### logWriter?

> `optional` **logWriter**: [`LogWriter`](globals.md#logwriter-1)

Defined in: [types.ts:344](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L344)

***

### LogWriter

Defined in: [types.ts:332](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L332)

Interface for custom log writers

#### Methods

##### init()

> **init**(`logPath`): `void`

Defined in: [types.ts:333](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L333)

###### Parameters

###### logPath

`string`

###### Returns

`void`

##### write()

> **write**(`data`): `void`

Defined in: [types.ts:334](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L334)

###### Parameters

###### data

`string`

###### Returns

`void`

***

### MemoryStore

Defined in: [types.ts:21](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L21)

Interface for storing and retrieving memory data

#### Methods

##### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [types.ts:25](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L25)

###### Returns

`Promise`\<`void`\>

##### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [types.ts:24](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L24)

###### Parameters

###### key

`string`

###### Returns

`Promise`\<`void`\>

##### get()

> **get**\<`T`\>(`key`): `Promise`\<`null` \| `T`\>

Defined in: [types.ts:22](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L22)

###### Type Parameters

• **T**

###### Parameters

###### key

`string`

###### Returns

`Promise`\<`null` \| `T`\>

##### set()

> **set**\<`T`\>(`key`, `value`): `Promise`\<`void`\>

Defined in: [types.ts:23](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L23)

###### Type Parameters

• **T**

###### Parameters

###### key

`string`

###### value

`T`

###### Returns

`Promise`\<`void`\>

***

### ResearchConfig

Defined in: [types.ts:363](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L363)

Configuration for research operations

#### Properties

##### breadth

> **breadth**: `number`

Defined in: [types.ts:365](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L365)

##### depth

> **depth**: `number`

Defined in: [types.ts:366](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L366)

##### learnings?

> `optional` **learnings**: `string`[]

Defined in: [types.ts:367](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L367)

##### query

> **query**: `string`

Defined in: [types.ts:364](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L364)

##### visitedUrls?

> `optional` **visitedUrls**: `string`[]

Defined in: [types.ts:368](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L368)

***

### ResearchResult

Defined in: [types.ts:357](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L357)

Results from a research operation

#### Properties

##### learnings

> **learnings**: `string`[]

Defined in: [types.ts:358](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L358)

##### visitedUrls

> **visitedUrls**: `string`[]

Defined in: [types.ts:359](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L359)

***

### WorkingMemory

Defined in: [types.ts:28](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L28)

#### Properties

##### calls

> **calls**: [`ActionCall`](globals.md#actioncalldata)\<`any`\>[]

Defined in: [types.ts:32](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L32)

##### inputs

> **inputs**: [`InputRef`](globals.md#inputref)[]

Defined in: [types.ts:29](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L29)

##### outputs

> **outputs**: [`OutputRef`](globals.md#outputref)[]

Defined in: [types.ts:30](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L30)

##### results

> **results**: [`ActionResult`](globals.md#actionresultdata)\<`any`\>[]

Defined in: [types.ts:33](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L33)

##### thoughts

> **thoughts**: [`Thought`](globals.md#thought)[]

Defined in: [types.ts:31](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L31)

## Type Aliases

### Action\<Schema, Result, Context, TAgent\>

> **Action**\<`Schema`, `Result`, `Context`, `TAgent`\>: `object`

Defined in: [types.ts:43](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L43)

Represents an action that can be executed with typed parameters

#### Type Parameters

• **Schema** *extends* `z.AnyZodObject` = `z.AnyZodObject`

Zod schema defining parameter types

• **Result** = `any`

Return type of the action

• **Context** = `any`

Context type for the action execution

• **TAgent** *extends* [`AnyAgent`](globals.md#anyagent) = [`AnyAgent`](globals.md#anyagent)

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

##### handler()

> **handler**: (`call`, `ctx`, `agent`) => `Promise`\<`Result`\>

###### Parameters

###### call

[`ActionCall`](globals.md#actioncalldata)\<`z.infer`\<`Schema`\>\>

###### ctx

`Context`

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

##### name

> **name**: `string`

##### schema

> **schema**: `Schema`

***

### ActionCall\<Data\>

> **ActionCall**\<`Data`\>: `object`

Defined in: [types.ts:125](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L125)

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

***

### ActionResult\<Data\>

> **ActionResult**\<`Data`\>: `object`

Defined in: [types.ts:134](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L134)

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

***

### AnyAgent

> **AnyAgent**: [`Agent`](globals.md#agentmemory-t)\<`any`, `any`\>

Defined in: [types.ts:211](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L211)

***

### AnyPrompt

> **AnyPrompt**: [`Prompt`](globals.md#promptdata-variables)\<`any`, `any`\>

Defined in: [prompt.ts:47](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L47)

***

### Chain

> **Chain**: `object`

Defined in: [types.ts:13](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L13)

Represents an execution chain with experts and metadata

#### Type declaration

##### experts

> **experts**: `object`[]

##### id

> **id**: `string`

##### purpose

> **purpose**: `string`

##### thinking

> **thinking**: `string`

***

### Config\<TMemory, TContextHandler, Context\>

> **Config**\<`TMemory`, `TContextHandler`, `Context`\>: `object`

Defined in: [types.ts:271](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L271)

#### Type Parameters

• **TMemory** *extends* [`WorkingMemory`](globals.md#workingmemory) = [`WorkingMemory`](globals.md#workingmemory)

• **TContextHandler** *extends* [`ContextHandler`](globals.md#contexthandlert)\<`TMemory`\> = [`ContextHandler`](globals.md#contexthandlert)\<`TMemory`\>

• **Context** = [`InferContextFromHandler`](globals.md#infercontextfromhandlerthandler)\<`TContextHandler`\>

#### Type declaration

##### actions?

> `optional` **actions**: [`Action`](globals.md#actionschema-result-context-tagent)\<`any`, `any`, `Context`, [`Agent`](globals.md#agentmemory-t)\<`TMemory`, `TContextHandler`\>\>[]

##### container?

> `optional` **container**: `Container`

##### context?

> `optional` **context**: `TContextHandler`

##### debugger?

> `optional` **debugger**: [`Debugger`](globals.md#debugger-2)

##### events?

> `optional` **events**: `Record`\<`string`, `z.AnyZodObject`\>

##### experts?

> `optional` **experts**: `Record`\<`string`, [`ExpertConfig`](globals.md#expertconfigcontext)\<`Context`\>\>

##### inputs?

> `optional` **inputs**: `Record`\<`string`, [`InputConfig`](globals.md#inputconfigt-context-tagent)\<`any`, `Context`, [`Agent`](globals.md#agentmemory-t)\<`TMemory`, `TContextHandler`\>\>\>

##### logger?

> `optional` **logger**: [`LogLevel`](globals.md#loglevel)

##### memory

> **memory**: [`MemoryStore`](globals.md#memorystore)

##### model

> **model**: `LanguageModelV1`

##### outputs?

> `optional` **outputs**: `Record`\<`string`, [`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`any`, `Context`, [`Agent`](globals.md#agentmemory-t)\<`TMemory`, `TContextHandler`\>\>\>

##### reasoningModel?

> `optional` **reasoningModel**: `LanguageModelV1`

##### services?

> `optional` **services**: `ServiceProvider`[]

***

### ContextHandler()\<T\>

> **ContextHandler**\<`T`\>: (`memory`) => `object`

Defined in: [types.ts:255](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L255)

#### Type Parameters

• **T** *extends* [`WorkingMemory`](globals.md#workingmemory) = [`WorkingMemory`](globals.md#workingmemory)

#### Parameters

##### memory

[`MemoryStore`](globals.md#memorystore)

#### Returns

`object`

##### get()

> **get**: (`id`) => `Promise`\<\{ `id`: `string`; `memory`: `T`; \}\>

###### Parameters

###### id

`string`

###### Returns

`Promise`\<\{ `id`: `string`; `memory`: `T`; \}\>

##### render()

> **render**: (`data`) => `string` \| `string`[]

###### Parameters

###### data

`T`

###### Returns

`string` \| `string`[]

##### save()

> **save**: (`id`, `data`) => `Promise`\<`void`\>

###### Parameters

###### id

`string`

###### data

`T`

###### Returns

`Promise`\<`void`\>

***

### COTProps

> **COTProps**: `object`

Defined in: [types.ts:153](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L153)

Properties required for Chain-of-Thought execution

#### Type declaration

##### actions

> **actions**: [`Action`](globals.md#actionschema-result-context-tagent)[]

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

***

### COTResponse

> **COTResponse**: `object`

Defined in: [types.ts:163](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L163)

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

***

### Debugger()

> **Debugger**: (`contextId`, `keys`, `data`) => `void`

Defined in: [types.ts:269](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L269)

#### Parameters

##### contextId

`string`

##### keys

`string`[]

##### data

`any`

#### Returns

`void`

***

### ElementNode\<Attributes\>

> **ElementNode**\<`Attributes`\>: `object`

Defined in: [xml.ts:67](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L67)

#### Type Parameters

• **Attributes** *extends* `Record`\<`string`, `string`\> = `Record`\<`string`, `any`\>

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

***

### Expert\<Context\>

> **Expert**\<`Context`\>: `object`

Defined in: [types.ts:198](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L198)

Represents an expert system with instructions and actions

#### Type Parameters

• **Context** = `any`

#### Type declaration

##### actions?

> `optional` **actions**: [`Action`](globals.md#actionschema-result-context-tagent)\<`any`, `any`, `Context`\>[]

##### description

> **description**: `string`

##### instructions

> **instructions**: `string`

##### model?

> `optional` **model**: `LanguageModelV1`

##### type

> **type**: `string`

***

### ExpertConfig\<Context\>

> **ExpertConfig**\<`Context`\>: `Omit`\<[`Expert`](globals.md#expertcontext)\<`Context`\>, `"type"`\>

Defined in: [types.ts:317](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L317)

Configuration type for experts without type field

#### Type Parameters

• **Context** = `any`

***

### ExtractTemplateVariables\<T\>

> **ExtractTemplateVariables**\<`T`\>: `T` *extends* `` `${infer Start}{{${infer Var}}}${infer Rest}` `` ? `Var` \| [`ExtractTemplateVariables`](globals.md#extracttemplatevariablest)\<`Rest`\> : `never`

Defined in: [types.ts:184](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L184)

Extracts variable names from a template string

#### Type Parameters

• **T** *extends* `string`

Template string type

***

### Formatter()\<Variables, Data\>

> **Formatter**\<`Variables`, `Data`\>: (`data`) => `Record`\<keyof `Variables`, `any`\>

Defined in: [prompt.ts:8](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L8)

#### Type Parameters

• **Variables** *extends* `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

• **Data** = `any`

#### Parameters

##### data

`Data`

#### Returns

`Record`\<keyof `Variables`, `any`\>

***

### GeneratePromptConfig\<TPrompt, Variables, Data, TFormatter\>

> **GeneratePromptConfig**\<`TPrompt`, `Variables`, `Data`, `TFormatter`\>: `object`

Defined in: [prompt.ts:55](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L55)

#### Type Parameters

• **TPrompt** *extends* [`AnyPrompt`](globals.md#anyprompt) \| `string` = `any`

• **Variables** *extends* `Record`\<`string`, `any`\> = `any`

• **Data** = `Record`\<`string`, `any`\>

• **TFormatter** *extends* [`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\> = [`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\>

#### Type declaration

##### data

> **data**: `Data`

##### formatter?

> `optional` **formatter**: `TFormatter`

##### template

> **template**: `TPrompt`

##### variables

> **variables**: `Variables`

***

### GetVisitors\<Output, T\>

> **GetVisitors**\<`Output`, `T`\>: `{ [K in keyof T]?: PromptVisitor<Output, T[K]> }` & `object`

Defined in: [prompt.ts:27](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L27)

#### Type Parameters

• **Output** = `any`

• **T** *extends* `Record`\<`string`, `Record`\<`string`, `any`\>\> = `Record`\<`string`, `Record`\<`string`, `any`\>\>

***

### InferContextFromHandler\<THandler\>

> **InferContextFromHandler**\<`THandler`\>: [`AgentContext`](globals.md#agentcontextmemory)\<[`InferMemoryFromHandler`](globals.md#infermemoryfromhandlerthandler)\<`THandler`\>\>

Defined in: [types.ts:266](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L266)

#### Type Parameters

• **THandler** *extends* [`ContextHandler`](globals.md#contexthandlert)\<`any`\>

***

### InferFormatter\<TPrompt\>

> **InferFormatter**\<`TPrompt`\>: `TPrompt` *extends* [`Prompt`](globals.md#promptdata-variables)\<infer Data, infer Variables\> ? [`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\> : `never`

Defined in: [prompt.ts:13](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L13)

#### Type Parameters

• **TPrompt** *extends* [`AnyPrompt`](globals.md#anyprompt)

***

### InferGeneratePromptConfig\<TPrompt\>

> **InferGeneratePromptConfig**\<`TPrompt`\>: `TPrompt` *extends* [`Prompt`](globals.md#promptdata-variables)\<infer Data, infer Variables\> ? [`GeneratePromptConfig`](globals.md#generatepromptconfigtprompt-variables-data-tformatter)\<`TPrompt`, `Variables`, `Data`\> : `never` \| `TPrompt` *extends* `string` ? [`GeneratePromptConfig`](globals.md#generatepromptconfigtprompt-variables-data-tformatter)\<`TPrompt`, [`TemplateVariables`](globals.md#templatevariablest)\<`TPrompt`\>\> : `never`

Defined in: [prompt.ts:67](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L67)

#### Type Parameters

• **TPrompt** *extends* [`AnyPrompt`](globals.md#anyprompt) \| `string`

***

### InferMemoryFromHandler\<THandler\>

> **InferMemoryFromHandler**\<`THandler`\>: `THandler` *extends* [`ContextHandler`](globals.md#contexthandlert)\<infer Memory\> ? `Memory` : `unknown`

Defined in: [types.ts:263](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L263)

#### Type Parameters

• **THandler** *extends* [`ContextHandler`](globals.md#contexthandlert)\<`any`\>

***

### InferPromptComponents\<TPrompt\>

> **InferPromptComponents**\<`TPrompt`\>: `TPrompt` *extends* [`Prompt`](globals.md#promptdata-variables)\<`any`, infer Components\> ? `Components` : `never`

Defined in: [prompt.ts:75](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L75)

#### Type Parameters

• **TPrompt** *extends* [`AnyPrompt`](globals.md#anyprompt) \| `string`

***

### InferPromptData\<TPrompt\>

> **InferPromptData**\<`TPrompt`\>: `TPrompt` *extends* [`Prompt`](globals.md#promptdata-variables)\<infer Data\> ? `Data` : `never`

Defined in: [prompt.ts:52](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L52)

#### Type Parameters

• **TPrompt** *extends* [`AnyPrompt`](globals.md#anyprompt)

***

### InferPromptVariables\<TPrompt\>

> **InferPromptVariables**\<`TPrompt`\>: `TPrompt` *extends* [`Prompt`](globals.md#promptdata-variables)\<`any`, infer Vars\> ? `Vars` : `never`

Defined in: [prompt.ts:49](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L49)

#### Type Parameters

• **TPrompt** *extends* [`AnyPrompt`](globals.md#anyprompt)

***

### Input\<Schema, Context, TAgent\>

> **Input**\<`Schema`, `Context`, `TAgent`\>: `object`

Defined in: [types.ts:85](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L85)

Represents an input handler with validation and subscription capability

#### Type Parameters

• **Schema** *extends* `z.AnyZodObject` = `z.AnyZodObject`

Zod schema for input parameters

• **Context** = `any`

Context type for input handling

• **TAgent** *extends* [`AnyAgent`](globals.md#anyagent) = [`AnyAgent`](globals.md#anyagent)

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

> `optional` **subscribe**: (`send`, `agent`) => () => `void`

###### Parameters

###### send

(`conversationId`, `data`) => `void`

###### agent

`TAgent`

###### Returns

`Function`

###### Returns

`void`

##### type

> **type**: `string`

***

### InputConfig\<T, Context, TAgent\>

> **InputConfig**\<`T`, `Context`, `TAgent`\>: `Omit`\<[`Input`](globals.md#inputschema-context-tagent)\<`T`, `Context`, `TAgent`\>, `"type"`\>

Defined in: [types.ts:303](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L303)

Configuration type for inputs without type field

#### Type Parameters

• **T** *extends* `z.AnyZodObject` = `z.AnyZodObject`

• **Context** = `any`

• **TAgent** *extends* [`AnyAgent`](globals.md#anyagent) = [`AnyAgent`](globals.md#anyagent)

***

### InputRef

> **InputRef**: `object`

Defined in: [types.ts:106](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L106)

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

***

### Log

> **Log**: [`InputRef`](globals.md#inputref) \| [`OutputRef`](globals.md#outputref) \| [`Thought`](globals.md#thought) \| [`ActionCall`](globals.md#actioncalldata) \| [`ActionResult`](globals.md#actionresultdata)

Defined in: [types.ts:150](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L150)

***

### Node

> **Node**: [`TextNode`](globals.md#textnode) \| [`ElementNode`](globals.md#elementnodeattributes)

Defined in: [xml.ts:79](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L79)

***

### NodeVisitor()

> **NodeVisitor**: (`node`, `parse`) => [`Node`](globals.md#node)

Defined in: [xml.ts:81](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L81)

#### Parameters

##### node

[`Node`](globals.md#node)

##### parse

() => [`Node`](globals.md#node)[]

#### Returns

[`Node`](globals.md#node)

***

### Output\<Schema, Context, TAgent\>

> **Output**\<`Schema`, `Context`, `TAgent`\>: `object`

Defined in: [types.ts:63](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L63)

#### Type Parameters

• **Schema** *extends* [`OutputSchema`](globals.md#outputschema) = [`OutputSchema`](globals.md#outputschema)

• **Context** = `any`

• **TAgent** *extends* [`AnyAgent`](globals.md#anyagent) = [`AnyAgent`](globals.md#anyagent)

#### Type declaration

##### description

> **description**: `string`

##### enabled()?

> `optional` **enabled**: (`ctx`) => `boolean`

###### Parameters

###### ctx

`Context`

###### Returns

`boolean`

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

##### type

> **type**: `string`

***

### OutputConfig\<T, Context, TAgent\>

> **OutputConfig**\<`T`, `Context`, `TAgent`\>: `Omit`\<[`Output`](globals.md#outputschema-context-tagent)\<`T`, `Context`\>, `"type"`\>

Defined in: [types.ts:310](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L310)

Configuration type for outputs without type field

#### Type Parameters

• **T** *extends* [`OutputSchema`](globals.md#outputschema) = [`OutputSchema`](globals.md#outputschema)

• **Context** = `any`

• **TAgent** *extends* [`AnyAgent`](globals.md#anyagent) = [`AnyAgent`](globals.md#anyagent)

***

### OutputRef

> **OutputRef**: `object`

Defined in: [types.ts:116](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L116)

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

***

### OutputSchema

> **OutputSchema**: `z.AnyZodObject` \| `z.ZodString`

Defined in: [types.ts:61](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L61)

***

### Parser()\<Output\>

> **Parser**\<`Output`\>: (`content`) => `Output`

Defined in: [prompt.ts:102](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L102)

#### Type Parameters

• **Output**

#### Parameters

##### content

`string`

#### Returns

`Output`

***

### Pretty\<type\>

> **Pretty**\<`type`\>: `{ [key in keyof type]: type[key] }` & `unknown`

Defined in: [types.ts:178](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L178)

Utility type to preserve type information

#### Type Parameters

• **type**

***

### Prompt()\<Data, Variables\>

> **Prompt**\<`Data`, `Variables`\>: \<`TData`\>(`data`, `formatter`?) => `string`

Defined in: [prompt.ts:39](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L39)

#### Type Parameters

• **Data** = `any`

• **Variables** *extends* `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

#### Type Parameters

• **TData** *extends* `Data`

#### Parameters

##### data

`TData`

##### formatter?

[`Formatter`](globals.md#formattervariables-data)\<`Variables`, `TData`\>

#### Returns

`string`

***

### PromptVisitor()\<Output, Attributes\>

> **PromptVisitor**\<`Output`, `Attributes`\>: (`output`, `node`, `parse`) => `void`

Defined in: [prompt.ts:18](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L18)

#### Type Parameters

• **Output** = `any`

• **Attributes** *extends* `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

#### Parameters

##### output

`Output`

##### node

[`ElementNode`](globals.md#elementnodeattributes)\<`Attributes`\>

##### parse

() => [`Node`](globals.md#node)[]

#### Returns

`void`

***

### Subscription()

> **Subscription**: () => `void`

Defined in: [types.ts:320](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L320)

Function type for subscription cleanup

#### Returns

`void`

***

### Task

> **Task**: `object`

Defined in: [types.ts:7](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L7)

Represents a task with text content and completion status

#### Type declaration

##### complete

> **complete**: `boolean`

##### text

> **text**: `string`

***

### TemplateVariables\<T\>

> **TemplateVariables**\<`T`\>: [`Pretty`](globals.md#prettytype)\<\{ \[K in ExtractTemplateVariables\<T\>\]: string \| string\[\] \| object \}\>

Defined in: [types.ts:193](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L193)

Creates a type mapping template variables to string values

#### Type Parameters

• **T** *extends* `string`

Template string type

***

### TextNode

> **TextNode**: `object`

Defined in: [xml.ts:60](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L60)

#### Type declaration

##### children?

> `optional` **children**: `never`

##### content

> **content**: `string`

##### parent?

> `optional` **parent**: [`Node`](globals.md#node)

##### type

> **type**: `"text"`

***

### Thought

> **Thought**: `object`

Defined in: [types.ts:144](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L144)

Represents a thought or reasoning step

#### Type declaration

##### content

> **content**: `string`

##### ref

> **ref**: `"thought"`

##### timestamp

> **timestamp**: `number`

***

### XMLElement

> **XMLElement**: `object`

Defined in: [types.ts:171](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/types.ts#L171)

Represents an XML element structure

#### Type declaration

##### content

> **content**: `string` \| ([`XMLElement`](globals.md#xmlelement) \| `string`)[]

##### params?

> `optional` **params**: `Record`\<`string`, `string`\>

##### tag

> **tag**: `string`

## Functions

### action()

> **action**\<`Schema`, `Result`, `Context`, `TAgent`\>(`action`): [`Action`](globals.md#actionschema-result-context-tagent)\<`Schema`, `Result`, `Context`, `TAgent`\>

Defined in: [utils.ts:66](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L66)

Creates an action configuration

#### Type Parameters

• **Schema** *extends* `AnyZodObject` = `AnyZodObject`

Zod schema type for action parameters

• **Result** = `any`

Return type of the action

• **Context** = `any`

Context type for action execution

• **TAgent** *extends* [`Agent`](globals.md#agentmemory-t)\<`any`, `any`\> = [`Agent`](globals.md#agentmemory-t)\<`any`, `any`\>

#### Parameters

##### action

[`Action`](globals.md#actionschema-result-context-tagent)\<`Schema`, `Result`, `Context`, `TAgent`\>

Action configuration object

#### Returns

[`Action`](globals.md#actionschema-result-context-tagent)\<`Schema`, `Result`, `Context`, `TAgent`\>

Typed action configuration

***

### chainOfThought()

> **chainOfThought**(`__namedParameters`): `Promise`\<[`COTResponse`](globals.md#cotresponse)\>

Defined in: [cot.ts:81](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/cot.ts#L81)

#### Parameters

##### \_\_namedParameters

[`COTProps`](globals.md#cotprops)

#### Returns

`Promise`\<[`COTResponse`](globals.md#cotresponse)\>

***

### createContextHandler()

> **createContextHandler**\<`T`\>(`memoryCreator`, `renderContext`): (`memory`) => `object`

Defined in: [memory.ts:4](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/memory.ts#L4)

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

***

### createDreams()

> **createDreams**\<`Memory`, `Handler`\>(`config`): [`Agent`](globals.md#agentmemory-t)\<`Memory`, `Handler`\>

Defined in: [dreams.ts:168](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/dreams.ts#L168)

#### Type Parameters

• **Memory** *extends* [`WorkingMemory`](globals.md#workingmemory) = [`WorkingMemory`](globals.md#workingmemory)

• **Handler** *extends* [`ContextHandler`](globals.md#contexthandlert)\<`Memory`\> = [`ContextHandler`](globals.md#contexthandlert)\<`Memory`\>

#### Parameters

##### config

[`Config`](globals.md#configtmemory-tcontexthandler-context)\<`Memory`, `Handler`\>

#### Returns

[`Agent`](globals.md#agentmemory-t)\<`Memory`, `Handler`\>

***

### createMemoryStore()

> **createMemoryStore**(): [`MemoryStore`](globals.md#memorystore)

Defined in: [memory.ts:49](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/memory.ts#L49)

#### Returns

[`MemoryStore`](globals.md#memorystore)

***

### createParser()

> **createParser**\<`Output`, `Components`, `Visitors`\>(`getOutput`, `visitors`): [`Parser`](globals.md#parseroutput)\<`Output`\>

Defined in: [prompt.ts:104](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L104)

#### Type Parameters

• **Output** = `any`

• **Components** *extends* `Record`\<`string`, `Record`\<`string`, `any`\>\> = `Record`\<`string`, `Record`\<`string`, `any`\>\>

• **Visitors** *extends* [`GetVisitors`](globals.md#getvisitorsoutput-t)\<`Output`, `Components`\> = [`GetVisitors`](globals.md#getvisitorsoutput-t)\<`Output`, `Components`\>

#### Parameters

##### getOutput

() => `Output`

##### visitors

`Visitors`

#### Returns

[`Parser`](globals.md#parseroutput)\<`Output`\>

***

### createPrompt()

> **createPrompt**\<`Data`, `Template`, `Variables`\>(`prompt`, `formatter`): [`Prompt`](globals.md#promptdata-variables)\<`Data`, `Variables`\>

Defined in: [prompt.ts:82](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L82)

#### Type Parameters

• **Data** *extends* `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\>

• **Template** *extends* `string` = `string`

• **Variables** *extends* \{ \[key in string\]: \{ \[K in string\]: string \| object \| string\[\] \}\[key\] \} = \{ \[key in string\]: \{ \[K in string\]: string \| object \| string\[\] \}\[key\] \}

#### Parameters

##### prompt

`Template`

##### formatter

[`Formatter`](globals.md#formattervariables-data)\<`Variables`, `Data`\>

#### Returns

[`Prompt`](globals.md#promptdata-variables)\<`Data`, `Variables`\>

***

### createTagParser()

> **createTagParser**\<`T`\>(`tagName`, `contentParser`?): (`content`) => `object`[]

Defined in: [xml.ts:36](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L36)

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

***

### createTagRegex()

> **createTagRegex**(`tagName`): `RegExp`

Defined in: [xml.ts:29](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L29)

Creates a regular expression to match XML tags with a specific name

#### Parameters

##### tagName

`string`

The name of the XML tag to match

#### Returns

`RegExp`

RegExp that matches the specified XML tag and captures its attributes and content

***

### defaultContext()

> **defaultContext**(): [`WorkingMemory`](globals.md#workingmemory)

Defined in: [memory.ts:25](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/memory.ts#L25)

#### Returns

[`WorkingMemory`](globals.md#workingmemory)

***

### defaultContextRender()

> **defaultContextRender**(`memory`): `string`[]

Defined in: [memory.ts:35](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/memory.ts#L35)

#### Parameters

##### memory

[`WorkingMemory`](globals.md#workingmemory)

#### Returns

`string`[]

***

### expert()

> **expert**\<`Context`\>(`config`): [`ExpertConfig`](globals.md#expertconfigcontext)\<`Context`\>

Defined in: [utils.ts:97](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L97)

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

***

### formatAction()

> **formatAction**(`action`): `string`

Defined in: [formatters.ts:55](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/formatters.ts#L55)

#### Parameters

##### action

[`Action`](globals.md#actionschema-result-context-tagent)\<`any`, `any`, `any`\>

#### Returns

`string`

***

### formatContext()

> **formatContext**(`i`): `string`

Defined in: [formatters.ts:76](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/formatters.ts#L76)

#### Parameters

##### i

[`Log`](globals.md#log)

#### Returns

`string`

***

### formatInput()

> **formatInput**(`input`): `string`

Defined in: [formatters.ts:11](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/formatters.ts#L11)

Formats an input reference into XML format

#### Parameters

##### input

[`InputRef`](globals.md#inputref)

The input reference to format

#### Returns

`string`

XML string representation of the input

***

### formatOutput()

> **formatOutput**(`output`): `string`

Defined in: [formatters.ts:25](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/formatters.ts#L25)

Formats an output reference into XML format

#### Parameters

##### output

[`OutputRef`](globals.md#outputref)

The output reference to format

#### Returns

`string`

XML string representation of the output

***

### formatOutputInterface()

> **formatOutputInterface**(`output`): `string`

Defined in: [formatters.ts:41](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/formatters.ts#L41)

Formats an output interface definition into XML format

#### Parameters

##### output

[`Output`](globals.md#outputschema-context-tagent)

The output interface to format

#### Returns

`string`

XML string representation of the output interface

***

### formatValue()

> **formatValue**(`value`): `string`

Defined in: [utils.ts:35](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L35)

Formats a value for template rendering

#### Parameters

##### value

`any`

The value to format

#### Returns

`string`

Formatted string representation of the value

***

### formatXml()

> **formatXml**(`__namedParameters`): `string`

Defined in: [xml.ts:10](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L10)

Formats an XML element into a string representation

#### Parameters

##### \_\_namedParameters

[`XMLElement`](globals.md#xmlelement)

#### Returns

`string`

Formatted XML string

***

### getOrCreateConversationMemory()

> **getOrCreateConversationMemory**(`memory`): `object`

Defined in: [memory.ts:44](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/memory.ts#L44)

#### Parameters

##### memory

[`MemoryStore`](globals.md#memorystore)

#### Returns

`object`

##### get()

> **get**: (`contextId`) => `Promise`\<\{ `id`: `string`; `memory`: [`WorkingMemory`](globals.md#workingmemory); \}\>

###### Parameters

###### contextId

`string`

###### Returns

`Promise`\<\{ `id`: `string`; `memory`: [`WorkingMemory`](globals.md#workingmemory); \}\>

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

***

### getZodJsonSchema()

> **getZodJsonSchema**(`schema`): `JsonSchema7Type`

Defined in: [prompt.ts:78](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/prompt.ts#L78)

#### Parameters

##### schema

`ZodType`\<`any`\>

#### Returns

`JsonSchema7Type`

***

### input()

> **input**\<`Schema`, `Context`, `TAgent`\>(`config`): [`InputConfig`](globals.md#inputconfigt-context-tagent)\<`Schema`, `Context`, `TAgent`\>

Defined in: [utils.ts:48](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L48)

Creates an input configuration

#### Type Parameters

• **Schema** *extends* `AnyZodObject` = `AnyZodObject`

Zod schema type for input validation

• **Context** = `any`

Context type for input handling

• **TAgent** *extends* [`Agent`](globals.md#agentmemory-t)\<`any`, `any`\> = [`Agent`](globals.md#agentmemory-t)\<`any`, `any`\>

#### Parameters

##### config

[`InputConfig`](globals.md#inputconfigt-context-tagent)\<`Schema`, `Context`, `TAgent`\>

Input configuration object

#### Returns

[`InputConfig`](globals.md#inputconfigt-context-tagent)\<`Schema`, `Context`, `TAgent`\>

Typed input configuration

***

### isElement()

> **isElement**(`node`): `node is ElementNode<Record<string, any>>`

Defined in: [xml.ts:181](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L181)

#### Parameters

##### node

[`Node`](globals.md#node)

#### Returns

`node is ElementNode<Record<string, any>>`

***

### isText()

> **isText**(`node`): `node is TextNode`

Defined in: [xml.ts:185](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L185)

#### Parameters

##### node

[`Node`](globals.md#node)

#### Returns

`node is TextNode`

***

### llm()

> **llm**(`__namedParameters`): `Promise`\<`GenerateTextResult`\<`Record`\<`string`, `CoreTool`\<`any`, `any`\>\>, `never`\>\>

Defined in: [llm.ts:3](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/llm.ts#L3)

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

`Promise`\<`GenerateTextResult`\<`Record`\<`string`, `CoreTool`\<`any`, `any`\>\>, `never`\>\>

***

### output()

> **output**\<`Schema`, `Context`\>(`config`): [`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`Schema`, `Context`\>

Defined in: [utils.ts:84](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L84)

Creates an output configuration

#### Type Parameters

• **Schema** *extends* [`OutputSchema`](globals.md#outputschema) = [`OutputSchema`](globals.md#outputschema)

Zod schema type for output validation

• **Context** = `any`

Context type for output handling

#### Parameters

##### config

[`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`Schema`, `Context`\>

Output configuration object

#### Returns

[`OutputConfig`](globals.md#outputconfigt-context-tagent)\<`Schema`, `Context`\>

Typed output configuration

***

### parse()

> **parse**(`text`, `visitor`, `depth`, `parent`): [`Node`](globals.md#node)[]

Defined in: [xml.ts:93](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L93)

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

***

### parseAttributes()

> **parseAttributes**(`text`): `Record`\<`string`, `string`\>

Defined in: [xml.ts:83](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/xml.ts#L83)

#### Parameters

##### text

`string`

#### Returns

`Record`\<`string`, `string`\>

***

### render()

> **render**\<`Template`\>(`str`, `data`): `string`

Defined in: [utils.ts:19](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L19)

Renders a template string by replacing variables with provided values

#### Type Parameters

• **Template** *extends* `string`

The template string type containing variables in {{var}} format

#### Parameters

##### str

`Template`

The template string to render

##### data

\{ \[key in string\]: \{ \[K in string\]: string \| object \| string\[\] \}\[key\] \}

Object containing values for template variables

#### Returns

`string`

The rendered string with variables replaced

***

### splitTextIntoChunks()

> **splitTextIntoChunks**(`text`, `options`): `string`[]

Defined in: [utils.ts:107](https://github.com/dojoengine/daydreams/blob/ea09015bda51c0b0b7124c3f15c2d09c669fc4f9/packages/core/src/core/v1/utils.ts#L107)

#### Parameters

##### text

`string`

##### options

`ChunkOptions`

#### Returns

`string`[]
