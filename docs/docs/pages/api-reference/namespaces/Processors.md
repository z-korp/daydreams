# Processors

## Classes

### MessageProcessor

Defined in: [packages/core/src/core/processors/message-processor.ts:12](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processors/message-processor.ts#L12)

Base abstract class for content processors that handle different types of input
and generate appropriate responses using LLM.

#### Extends

- [`BaseProcessor`](../globals.md#baseprocessor)

#### Constructors

##### new MessageProcessor()

> **new MessageProcessor**(`llmClient`, `character`, `logLevel`): [`MessageProcessor`](Processors.md#messageprocessor)

Defined in: [packages/core/src/core/processors/message-processor.ts:13](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processors/message-processor.ts#L13)

###### Parameters

###### llmClient

[`LLMClient`](../globals.md#llmclient-1)

###### character

[`Character`](Types.md#character)

###### logLevel

[`LogLevel`](Types.md#loglevel) = `LogLevel.ERROR`

###### Returns

[`MessageProcessor`](Processors.md#messageprocessor)

###### Overrides

[`BaseProcessor`](../globals.md#baseprocessor).[`constructor`](../globals.md#constructors)

#### Properties

##### character

> `protected` **character**: [`Character`](Types.md#character)

Defined in: [packages/core/src/core/processors/message-processor.ts:15](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processors/message-processor.ts#L15)

The character personality to use for responses

###### Inherited from

[`BaseProcessor`](../globals.md#baseprocessor).[`character`](../globals.md#character)

##### llmClient

> `protected` **llmClient**: [`LLMClient`](../globals.md#llmclient-1)

Defined in: [packages/core/src/core/processors/message-processor.ts:14](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processors/message-processor.ts#L14)

The LLM client instance to use for processing

###### Inherited from

[`BaseProcessor`](../globals.md#baseprocessor).[`llmClient`](../globals.md#llmclient)

##### logger

> `protected` **logger**: [`Logger`](../globals.md#logger-1)

Defined in: [packages/core/src/core/processor.ts:15](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processor.ts#L15)

Logger instance for this processor

###### Inherited from

[`BaseProcessor`](../globals.md#baseprocessor).[`logger`](../globals.md#logger)

##### loggerLevel

> `protected` **loggerLevel**: [`LogLevel`](Types.md#loglevel) = `LogLevel.ERROR`

Defined in: [packages/core/src/core/processor.ts:26](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processor.ts#L26)

The logging level to use

###### Inherited from

[`BaseProcessor`](../globals.md#baseprocessor).[`loggerLevel`](../globals.md#loggerlevel)

##### metadata

> `protected` **metadata**: `object`

Defined in: [packages/core/src/core/processor.ts:25](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processor.ts#L25)

Metadata about this processor including name and description

###### description

> **description**: `string`

###### name

> **name**: `string`

###### Inherited from

[`BaseProcessor`](../globals.md#baseprocessor).[`metadata`](../globals.md#metadata)

#### Methods

##### canHandle()

> **canHandle**(`content`): `boolean`

Defined in: [packages/core/src/core/processors/message-processor.ts:31](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processors/message-processor.ts#L31)

Determines if this processor can handle the given content.

###### Parameters

###### content

`any`

The content to check

###### Returns

`boolean`

True if this processor can handle the content, false otherwise

###### Overrides

[`BaseProcessor`](../globals.md#baseprocessor).[`canHandle`](../globals.md#canhandle)

##### getName()

> **getName**(): `string`

Defined in: [packages/core/src/core/processor.ts:41](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processor.ts#L41)

Gets the name of this processor

###### Returns

`string`

The processor name from metadata

###### Inherited from

[`BaseProcessor`](../globals.md#baseprocessor).[`getName`](../globals.md#getname)

##### process()

> **process**(`content`, `otherContext`, `ioContext`?): `Promise`\<[`ProcessedResult`](Types.md#processedresult)\>

Defined in: [packages/core/src/core/processors/message-processor.ts:35](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/processors/message-processor.ts#L35)

Processes the given content and returns a result.

###### Parameters

###### content

`any`

The content to process

###### otherContext

`string`

Additional context string to consider during processing

###### ioContext?

Optional context containing available outputs and actions

###### availableActions

[`IOHandler`](Types.md#iohandler)[]

Array of available action handlers

###### availableOutputs

[`IOHandler`](Types.md#iohandler)[]

Array of available output handlers

###### Returns

`Promise`\<[`ProcessedResult`](Types.md#processedresult)\>

Promise resolving to the processed result

###### Overrides

[`BaseProcessor`](../globals.md#baseprocessor).[`process`](../globals.md#process)
