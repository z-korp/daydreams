# Types

## Enumerations

### HandlerRole

Defined in: [packages/core/src/core/types/index.ts:547](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L547)

#### Enumeration Members

##### ACTION

> **ACTION**: `"action"`

Defined in: [packages/core/src/core/types/index.ts:550](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L550)

##### INPUT

> **INPUT**: `"input"`

Defined in: [packages/core/src/core/types/index.ts:548](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L548)

##### OUTPUT

> **OUTPUT**: `"output"`

Defined in: [packages/core/src/core/types/index.ts:549](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L549)

***

### LogLevel

Defined in: [packages/core/src/core/types/index.ts:50](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L50)

#### Enumeration Members

##### DEBUG

> **DEBUG**: `3`

Defined in: [packages/core/src/core/types/index.ts:54](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L54)

##### ERROR

> **ERROR**: `0`

Defined in: [packages/core/src/core/types/index.ts:51](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L51)

##### INFO

> **INFO**: `2`

Defined in: [packages/core/src/core/types/index.ts:53](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L53)

##### TRACE

> **TRACE**: `4`

Defined in: [packages/core/src/core/types/index.ts:55](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L55)

##### WARN

> **WARN**: `1`

Defined in: [packages/core/src/core/types/index.ts:52](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L52)

## Interfaces

### ActionStep

Defined in: [packages/core/src/core/types/index.ts:85](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L85)

#### Extends

- [`BaseStep`](Types.md#basestep)

#### Properties

##### actionOutput?

> `optional` **actionOutput**: `any`

Defined in: [packages/core/src/core/types/index.ts:95](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L95)

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:87](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L87)

###### Overrides

[`BaseStep`](Types.md#basestep).[`content`](Types.md#content-1)

##### duration?

> `optional` **duration**: `number`

Defined in: [packages/core/src/core/types/index.ts:96](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L96)

##### error?

> `optional` **error**: `Error`

Defined in: [packages/core/src/core/types/index.ts:93](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L93)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:77](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L77)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`id`](Types.md#id-1)

##### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:82](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L82)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`meta`](Types.md#meta-1)

##### observations?

> `optional` **observations**: `string`

Defined in: [packages/core/src/core/types/index.ts:94](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L94)

##### tags?

> `optional` **tags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:81](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L81)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`tags`](Types.md#tags-1)

##### timestamp

> **timestamp**: `number`

Defined in: [packages/core/src/core/types/index.ts:80](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L80)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`timestamp`](Types.md#timestamp-1)

##### toolCall?

> `optional` **toolCall**: `object`

Defined in: [packages/core/src/core/types/index.ts:88](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L88)

###### arguments

> **arguments**: `any`

###### id

> **id**: `string`

###### name

> **name**: `string`

##### type

> **type**: `"action"`

Defined in: [packages/core/src/core/types/index.ts:86](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L86)

###### Overrides

[`BaseStep`](Types.md#basestep).[`type`](Types.md#type-1)

***

### AnalysisOptions

Defined in: [packages/core/src/core/types/index.ts:179](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L179)

#### Properties

##### formatResponse?

> `optional` **formatResponse**: `boolean`

Defined in: [packages/core/src/core/types/index.ts:184](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L184)

##### maxTokens?

> `optional` **maxTokens**: `number`

Defined in: [packages/core/src/core/types/index.ts:183](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L183)

##### role?

> `optional` **role**: `string`

Defined in: [packages/core/src/core/types/index.ts:181](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L181)

##### system?

> `optional` **system**: `string`

Defined in: [packages/core/src/core/types/index.ts:180](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L180)

##### temperature?

> `optional` **temperature**: `number`

Defined in: [packages/core/src/core/types/index.ts:182](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L182)

***

### BaseStep

Defined in: [packages/core/src/core/types/index.ts:76](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L76)

#### Extended by

- [`ActionStep`](Types.md#actionstep)
- [`PlanningStep`](Types.md#planningstep)
- [`SystemStep`](Types.md#systemstep)
- [`TaskStep`](Types.md#taskstep)

#### Properties

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:79](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L79)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:77](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L77)

##### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:82](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L82)

##### tags?

> `optional` **tags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:81](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L81)

##### timestamp

> **timestamp**: `number`

Defined in: [packages/core/src/core/types/index.ts:80](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L80)

##### type

> **type**: [`StepType`](Types.md#steptype)

Defined in: [packages/core/src/core/types/index.ts:78](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L78)

***

### ChainOfThoughtContext

Defined in: [packages/core/src/core/types/index.ts:9](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L9)

ChainOfThoughtContext can hold any relevant data
the LLM or game might need to keep track of during reasoning.

#### Properties

##### actionHistory?

> `optional` **actionHistory**: `Record`\<`number`, \{ `action`: [`CoTAction`](Types.md#cotaction); `result`: `string`; \}\>

Defined in: [packages/core/src/core/types/index.ts:12](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L12)

##### pastExperiences?

> `optional` **pastExperiences**: [`EpisodicMemory`](Types.md#episodicmemory)[]

Defined in: [packages/core/src/core/types/index.ts:19](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L19)

##### relevantKnowledge?

> `optional` **relevantKnowledge**: [`Documentation`](Types.md#documentation)[]

Defined in: [packages/core/src/core/types/index.ts:20](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L20)

##### worldState

> **worldState**: `string`

Defined in: [packages/core/src/core/types/index.ts:11](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L11)

***

### ChainOfThoughtEvents

Defined in: [packages/core/src/core/types/index.ts:196](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L196)

#### Properties

##### action:complete()

> **action:complete**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:199](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L199)

###### Parameters

###### data

###### action

[`CoTAction`](Types.md#cotaction)

###### result

`string`

###### Returns

`void`

##### action:error()

> **action:error**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:200](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L200)

###### Parameters

###### data

###### action

[`CoTAction`](Types.md#cotaction)

###### error

`unknown`

###### Returns

`void`

##### action:start()

> **action:start**: (`action`) => `void`

Defined in: [packages/core/src/core/types/index.ts:198](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L198)

###### Parameters

###### action

[`CoTAction`](Types.md#cotaction)

###### Returns

`void`

##### goal:blocked()

> **goal:blocked**: (`goal`) => `void`

Defined in: [packages/core/src/core/types/index.ts:213](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L213)

###### Parameters

###### goal

###### id

`string`

###### reason

`string`

###### Returns

`void`

##### goal:completed()

> **goal:completed**: (`goal`) => `void`

Defined in: [packages/core/src/core/types/index.ts:210](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L210)

###### Parameters

###### goal

###### id

`string`

###### result

`any`

###### Returns

`void`

##### goal:created()

> **goal:created**: (`goal`) => `void`

Defined in: [packages/core/src/core/types/index.ts:208](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L208)

###### Parameters

###### goal

###### description

`string`

###### id

`string`

###### Returns

`void`

##### goal:failed()

> **goal:failed**: (`goal`) => `void`

Defined in: [packages/core/src/core/types/index.ts:211](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L211)

###### Parameters

###### goal

###### error

`unknown`

###### id

`string`

###### Returns

`void`

##### goal:started()

> **goal:started**: (`goal`) => `void`

Defined in: [packages/core/src/core/types/index.ts:212](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L212)

###### Parameters

###### goal

###### description

`string`

###### id

`string`

###### Returns

`void`

##### goal:updated()

> **goal:updated**: (`goal`) => `void`

Defined in: [packages/core/src/core/types/index.ts:209](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L209)

###### Parameters

###### goal

###### id

`string`

###### status

[`GoalStatus`](Types.md#goalstatus)

###### Returns

`void`

##### memory:experience\_retrieved()

> **memory:experience\_retrieved**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:216](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L216)

###### Parameters

###### data

###### experiences

[`EpisodicMemory`](Types.md#episodicmemory)[]

###### Returns

`void`

##### memory:experience\_stored()

> **memory:experience\_stored**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:214](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L214)

###### Parameters

###### data

###### experience

[`EpisodicMemory`](Types.md#episodicmemory)

###### Returns

`void`

##### memory:knowledge\_retrieved()

> **memory:knowledge\_retrieved**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:219](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L219)

###### Parameters

###### data

###### documents

[`Documentation`](Types.md#documentation)[]

###### Returns

`void`

##### memory:knowledge\_stored()

> **memory:knowledge\_stored**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:215](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L215)

###### Parameters

###### data

###### document

[`Documentation`](Types.md#documentation)

###### Returns

`void`

##### step()

> **step**: (`step`) => `void`

Defined in: [packages/core/src/core/types/index.ts:197](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L197)

###### Parameters

###### step

[`Step`](Types.md#step-1)

###### Returns

`void`

##### think:complete()

> **think:complete**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:205](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L205)

###### Parameters

###### data

###### query

`string`

###### Returns

`void`

##### think:error()

> **think:error**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:207](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L207)

###### Parameters

###### data

###### error

`unknown`

###### query

`string`

###### Returns

`void`

##### think:start()

> **think:start**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:204](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L204)

###### Parameters

###### data

###### query

`string`

###### Returns

`void`

##### think:timeout()

> **think:timeout**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:206](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L206)

###### Parameters

###### data

###### query

`string`

###### Returns

`void`

##### trace:tokens()

> **trace:tokens**: (`data`) => `void`

Defined in: [packages/core/src/core/types/index.ts:222](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L222)

###### Parameters

###### data

###### input

`number`

###### output

`number`

###### Returns

`void`

***

### Character

Defined in: [packages/core/src/core/types/index.ts:266](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L266)

#### Properties

##### bio

> **bio**: `string`

Defined in: [packages/core/src/core/types/index.ts:268](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L268)

##### instructions

> **instructions**: [`CharacterInstructions`](Types.md#characterinstructions)

Defined in: [packages/core/src/core/types/index.ts:271](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L271)

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:267](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L267)

##### templates?

> `optional` **templates**: `object`

Defined in: [packages/core/src/core/types/index.ts:273](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L273)

###### replyTemplate?

> `optional` **replyTemplate**: `string`

###### thoughtTemplate?

> `optional` **thoughtTemplate**: `string`

###### tweetTemplate?

> `optional` **tweetTemplate**: `string`

##### traits

> **traits**: [`CharacterTrait`](Types.md#charactertrait)[]

Defined in: [packages/core/src/core/types/index.ts:269](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L269)

##### voice

> **voice**: [`CharacterVoice`](Types.md#charactervoice)

Defined in: [packages/core/src/core/types/index.ts:270](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L270)

***

### CharacterInstructions

Defined in: [packages/core/src/core/types/index.ts:258](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L258)

#### Properties

##### constraints

> **constraints**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:260](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L260)

##### contextRules

> **contextRules**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:263](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L263)

##### goals

> **goals**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:259](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L259)

##### responseStyle

> **responseStyle**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:262](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L262)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:261](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L261)

***

### CharacterTrait

Defined in: [packages/core/src/core/types/index.ts:243](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L243)

#### Properties

##### description

> **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:245](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L245)

##### examples

> **examples**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:247](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L247)

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:244](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L244)

##### strength

> **strength**: `number`

Defined in: [packages/core/src/core/types/index.ts:246](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L246)

***

### CharacterVoice

Defined in: [packages/core/src/core/types/index.ts:250](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L250)

#### Properties

##### commonPhrases

> **commonPhrases**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:254](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L254)

##### emojis

> **emojis**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:255](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L255)

##### style

> **style**: `string`

Defined in: [packages/core/src/core/types/index.ts:252](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L252)

##### tone

> **tone**: `string`

Defined in: [packages/core/src/core/types/index.ts:251](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L251)

##### vocabulary

> **vocabulary**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:253](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L253)

***

### Cluster

Defined in: [packages/core/src/core/types/index.ts:476](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L476)

#### Extended by

- [`HierarchicalCluster`](Types.md#hierarchicalcluster)

#### Properties

##### centroid?

> `optional` **centroid**: `number`[]

Defined in: [packages/core/src/core/types/index.ts:480](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L480)

##### description

> **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:479](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L479)

##### documentCount

> **documentCount**: `number`

Defined in: [packages/core/src/core/types/index.ts:482](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L482)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:477](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L477)

##### lastUpdated

> **lastUpdated**: `Date`

Defined in: [packages/core/src/core/types/index.ts:483](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L483)

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:478](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L478)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:481](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L481)

***

### ClusterMetadata

Defined in: [packages/core/src/core/types/index.ts:486](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L486)

#### Extended by

- [`DocumentClusterMetadata`](Types.md#documentclustermetadata)
- [`EpisodeClusterMetadata`](Types.md#episodeclustermetadata)

#### Properties

##### clusterId

> **clusterId**: `string`

Defined in: [packages/core/src/core/types/index.ts:487](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L487)

##### confidence

> **confidence**: `number`

Defined in: [packages/core/src/core/types/index.ts:488](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L488)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:489](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L489)

***

### ClusterStats

Defined in: [packages/core/src/core/types/index.ts:492](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L492)

#### Properties

##### averageDistance

> **averageDistance**: `number`

Defined in: [packages/core/src/core/types/index.ts:495](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L495)

##### memberCount

> **memberCount**: `number`

Defined in: [packages/core/src/core/types/index.ts:494](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L494)

##### variance

> **variance**: `number`

Defined in: [packages/core/src/core/types/index.ts:493](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L493)

***

### ClusterUpdate

Defined in: [packages/core/src/core/types/index.ts:498](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L498)

#### Properties

##### documentCount

> **documentCount**: `number`

Defined in: [packages/core/src/core/types/index.ts:500](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L500)

##### newCentroid?

> `optional` **newCentroid**: `number`[]

Defined in: [packages/core/src/core/types/index.ts:499](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L499)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:501](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L501)

##### variance?

> `optional` **variance**: `number`

Defined in: [packages/core/src/core/types/index.ts:502](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L502)

***

### CoTAction

Defined in: [packages/core/src/core/types/index.ts:27](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L27)

Data necessary for a particular action type.
Extend this to fit your actual logic.

#### Properties

##### payload

> **payload**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:29](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L29)

##### type

> **type**: `string`

Defined in: [packages/core/src/core/types/index.ts:28](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L28)

***

### Documentation

Defined in: [packages/core/src/core/types/index.ts:465](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L465)

#### Properties

##### category

> **category**: `string`

Defined in: [packages/core/src/core/types/index.ts:469](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L469)

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:468](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L468)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:466](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L466)

##### lastUpdated

> **lastUpdated**: `Date`

Defined in: [packages/core/src/core/types/index.ts:471](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L471)

##### relatedIds?

> `optional` **relatedIds**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:473](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L473)

##### source?

> `optional` **source**: `string`

Defined in: [packages/core/src/core/types/index.ts:472](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L472)

##### tags

> **tags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:470](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L470)

##### title

> **title**: `string`

Defined in: [packages/core/src/core/types/index.ts:467](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L467)

***

### DocumentClusterMetadata

Defined in: [packages/core/src/core/types/index.ts:505](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L505)

#### Extends

- [`ClusterMetadata`](Types.md#clustermetadata)

#### Properties

##### category

> **category**: `string`

Defined in: [packages/core/src/core/types/index.ts:506](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L506)

##### clusterId

> **clusterId**: `string`

Defined in: [packages/core/src/core/types/index.ts:487](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L487)

###### Inherited from

[`ClusterMetadata`](Types.md#clustermetadata).[`clusterId`](Types.md#clusterid)

##### commonTags

> **commonTags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:507](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L507)

##### confidence

> **confidence**: `number`

Defined in: [packages/core/src/core/types/index.ts:488](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L488)

###### Inherited from

[`ClusterMetadata`](Types.md#clustermetadata).[`confidence`](Types.md#confidence)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:489](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L489)

###### Inherited from

[`ClusterMetadata`](Types.md#clustermetadata).[`topics`](Types.md#topics-2)

***

### DomainMetadata

Defined in: [packages/core/src/core/types/index.ts:523](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L523)

#### Properties

##### confidence

> **confidence**: `number`

Defined in: [packages/core/src/core/types/index.ts:526](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L526)

##### domain

> **domain**: `string`

Defined in: [packages/core/src/core/types/index.ts:524](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L524)

##### subDomain?

> `optional` **subDomain**: `string`

Defined in: [packages/core/src/core/types/index.ts:525](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L525)

***

### EnrichedContent

Defined in: [packages/core/src/core/types/index.ts:315](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L315)

#### Properties

##### context

> **context**: [`EnrichedContext`](Types.md#enrichedcontext)

Defined in: [packages/core/src/core/types/index.ts:318](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L318)

##### originalContent

> **originalContent**: `string`

Defined in: [packages/core/src/core/types/index.ts:316](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L316)

##### timestamp

> **timestamp**: `Date`

Defined in: [packages/core/src/core/types/index.ts:317](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L317)

***

### EnrichedContext

Defined in: [packages/core/src/core/types/index.ts:302](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L302)

#### Properties

##### availableOutputs?

> `optional` **availableOutputs**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:312](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L312)

##### entities?

> `optional` **entities**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:308](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L308)

##### intent?

> `optional` **intent**: `string`

Defined in: [packages/core/src/core/types/index.ts:309](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L309)

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:311](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L311)

##### relatedMemories

> **relatedMemories**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:306](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L306)

##### sentiment?

> `optional` **sentiment**: `string`

Defined in: [packages/core/src/core/types/index.ts:307](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L307)

##### similarMessages?

> `optional` **similarMessages**: `any`[]

Defined in: [packages/core/src/core/types/index.ts:310](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L310)

##### summary

> **summary**: `string`

Defined in: [packages/core/src/core/types/index.ts:304](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L304)

##### timeContext

> **timeContext**: `string`

Defined in: [packages/core/src/core/types/index.ts:303](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L303)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:305](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L305)

***

### EpisodeClusterMetadata

Defined in: [packages/core/src/core/types/index.ts:510](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L510)

#### Extends

- [`ClusterMetadata`](Types.md#clustermetadata)

#### Properties

##### averageImportance

> **averageImportance**: `number`

Defined in: [packages/core/src/core/types/index.ts:512](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L512)

##### clusterId

> **clusterId**: `string`

Defined in: [packages/core/src/core/types/index.ts:487](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L487)

###### Inherited from

[`ClusterMetadata`](Types.md#clustermetadata).[`clusterId`](Types.md#clusterid)

##### commonEmotions

> **commonEmotions**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:511](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L511)

##### confidence

> **confidence**: `number`

Defined in: [packages/core/src/core/types/index.ts:488](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L488)

###### Inherited from

[`ClusterMetadata`](Types.md#clustermetadata).[`confidence`](Types.md#confidence)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:489](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L489)

###### Inherited from

[`ClusterMetadata`](Types.md#clustermetadata).[`topics`](Types.md#topics-2)

***

### EpisodicMemory

Defined in: [packages/core/src/core/types/index.ts:455](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L455)

#### Properties

##### action

> **action**: `string`

Defined in: [packages/core/src/core/types/index.ts:458](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L458)

##### context?

> `optional` **context**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:460](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L460)

##### emotions?

> `optional` **emotions**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:461](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L461)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:456](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L456)

##### importance?

> `optional` **importance**: `number`

Defined in: [packages/core/src/core/types/index.ts:462](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L462)

##### outcome

> **outcome**: `string`

Defined in: [packages/core/src/core/types/index.ts:459](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L459)

##### timestamp

> **timestamp**: `Date`

Defined in: [packages/core/src/core/types/index.ts:457](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L457)

***

### Goal

Defined in: [packages/core/src/core/types/index.ts:127](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L127)

#### Properties

##### completed\_at?

> `optional` **completed\_at**: `number`

Defined in: [packages/core/src/core/types/index.ts:138](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L138)

##### created\_at

> **created\_at**: `number`

Defined in: [packages/core/src/core/types/index.ts:137](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L137)

##### dependencies?

> `optional` **dependencies**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:133](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L133)

##### description

> **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:130](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L130)

##### horizon

> **horizon**: [`HorizonType`](Types.md#horizontype)

Defined in: [packages/core/src/core/types/index.ts:129](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L129)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:128](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L128)

##### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:140](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L140)

##### outcomeScore?

> `optional` **outcomeScore**: `number`

Defined in: [packages/core/src/core/types/index.ts:146](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L146)

A numeric measure of how successful this goal was completed.
You can define any scale you like: e.g. 0-1, or 0-100, or a positive/negative integer.

##### parentGoal?

> `optional` **parentGoal**: `string`

Defined in: [packages/core/src/core/types/index.ts:135](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L135)

##### priority

> **priority**: `number`

Defined in: [packages/core/src/core/types/index.ts:132](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L132)

##### progress?

> `optional` **progress**: `number`

Defined in: [packages/core/src/core/types/index.ts:139](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L139)

##### scoreHistory?

> `optional` **scoreHistory**: `object`[]

Defined in: [packages/core/src/core/types/index.ts:151](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L151)

Optional history of scores over time, if you want to track multiple attempts or partial runs.

###### comment?

> `optional` **comment**: `string`

###### score

> **score**: `number`

###### timestamp

> **timestamp**: `number`

##### status

> **status**: [`GoalStatus`](Types.md#goalstatus)

Defined in: [packages/core/src/core/types/index.ts:131](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L131)

##### subgoals?

> `optional` **subgoals**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:134](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L134)

##### success\_criteria

> **success\_criteria**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:136](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L136)

***

### HierarchicalCluster

Defined in: [packages/core/src/core/types/index.ts:515](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L515)

#### Extends

- [`Cluster`](Types.md#cluster)

#### Properties

##### centroid?

> `optional` **centroid**: `number`[]

Defined in: [packages/core/src/core/types/index.ts:480](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L480)

###### Inherited from

[`Cluster`](Types.md#cluster).[`centroid`](Types.md#centroid)

##### childIds

> **childIds**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:517](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L517)

##### description

> **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:479](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L479)

###### Inherited from

[`Cluster`](Types.md#cluster).[`description`](Types.md#description-1)

##### documentCount

> **documentCount**: `number`

Defined in: [packages/core/src/core/types/index.ts:482](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L482)

###### Inherited from

[`Cluster`](Types.md#cluster).[`documentCount`](Types.md#documentcount)

##### domain

> **domain**: `string`

Defined in: [packages/core/src/core/types/index.ts:519](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L519)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:477](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L477)

###### Inherited from

[`Cluster`](Types.md#cluster).[`id`](Types.md#id-2)

##### lastUpdated

> **lastUpdated**: `Date`

Defined in: [packages/core/src/core/types/index.ts:483](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L483)

###### Inherited from

[`Cluster`](Types.md#cluster).[`lastUpdated`](Types.md#lastupdated)

##### level

> **level**: `number`

Defined in: [packages/core/src/core/types/index.ts:518](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L518)

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:478](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L478)

###### Inherited from

[`Cluster`](Types.md#cluster).[`name`](Types.md#name-2)

##### parentId?

> `optional` **parentId**: `string`

Defined in: [packages/core/src/core/types/index.ts:516](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L516)

##### subDomain?

> `optional` **subDomain**: `string`

Defined in: [packages/core/src/core/types/index.ts:520](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L520)

##### topics

> **topics**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:481](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L481)

###### Inherited from

[`Cluster`](Types.md#cluster).[`topics`](Types.md#topics-1)

***

### IChain

Defined in: [packages/core/src/core/types/index.ts:529](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L529)

#### Properties

##### chainId

> **chainId**: `string`

Defined in: [packages/core/src/core/types/index.ts:533](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L533)

A unique identifier for the chain (e.g., "starknet", "ethereum", "solana", etc.)

#### Methods

##### read()

> **read**(`call`): `Promise`\<`any`\>

Defined in: [packages/core/src/core/types/index.ts:539](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L539)

Read (call) a contract or perform a query on this chain.
The `call` parameter can be chain-specific data.

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

##### write()

> **write**(`call`): `Promise`\<`any`\>

Defined in: [packages/core/src/core/types/index.ts:544](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L544)

Write (execute a transaction) on this chain, typically requiring signatures, etc.

###### Parameters

###### call

`unknown`

###### Returns

`Promise`\<`any`\>

***

### Input\<T\>

Defined in: [packages/core/src/core/types/index.ts:350](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L350)

Interface for defining input handlers that can be registered with the Core system.

#### Type Parameters

• **T** = `unknown`

The type of data returned by the input handler

#### Properties

##### handler()

> **handler**: (...`args`) => `Promise`\<`T`\>

Defined in: [packages/core/src/core/types/index.ts:354](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L354)

Handler function that processes the input and returns a Promise of type T

###### Parameters

###### args

...`unknown`[]

###### Returns

`Promise`\<`T`\>

##### interval?

> `optional` **interval**: `number`

Defined in: [packages/core/src/core/types/index.ts:367](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L367)

Optional interval in milliseconds for recurring inputs.
If set, the input will run repeatedly at this interval.

###### Example

```ts
// Run every minute
interval: 60000
```

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:352](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L352)

Unique identifier for this input

##### nextRun?

> `optional` **nextRun**: `number`

Defined in: [packages/core/src/core/types/index.ts:373](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L373)

Optional timestamp for when this input should next run.
If omitted, defaults to immediate execution (Date.now()).

##### response

> **response**: `ZodType`\<`T`, `T`\>

Defined in: [packages/core/src/core/types/index.ts:356](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L356)

Zod schema for validating the response

***

### IOHandler

Defined in: [packages/core/src/core/types/index.ts:556](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L556)

A single interface for all Inputs, Outputs.

#### Properties

##### handler()

> **handler**: (`payload`?) => `Promise`\<`unknown`\>

Defined in: [packages/core/src/core/types/index.ts:567](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L567)

The main function. For inputs, no payload is typically passed. For outputs, pass the data.

###### Parameters

###### payload?

`unknown`

###### Returns

`Promise`\<`unknown`\>

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:558](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L558)

Unique name for this handler

##### role

> **role**: [`HandlerRole`](Types.md#handlerrole)

Defined in: [packages/core/src/core/types/index.ts:561](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L561)

"input" | "output" | (optionally "action") if you want more roles

##### schema

> **schema**: `ZodType`

Defined in: [packages/core/src/core/types/index.ts:564](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L564)

The schema for the input handler

***

### LLMClientConfig

Defined in: [packages/core/src/core/types/index.ts:169](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L169)

#### Properties

##### baseDelay?

> `optional` **baseDelay**: `number`

Defined in: [packages/core/src/core/types/index.ts:175](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L175)

##### maxDelay?

> `optional` **maxDelay**: `number`

Defined in: [packages/core/src/core/types/index.ts:176](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L176)

##### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [packages/core/src/core/types/index.ts:171](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L171)

##### maxTokens?

> `optional` **maxTokens**: `number`

Defined in: [packages/core/src/core/types/index.ts:174](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L174)

##### model?

> `optional` **model**: `string`

Defined in: [packages/core/src/core/types/index.ts:170](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L170)

##### temperature?

> `optional` **temperature**: `number`

Defined in: [packages/core/src/core/types/index.ts:173](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L173)

##### timeout?

> `optional` **timeout**: `number`

Defined in: [packages/core/src/core/types/index.ts:172](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L172)

***

### LLMResponse

Defined in: [packages/core/src/core/types/index.ts:158](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L158)

#### Properties

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/core/types/index.ts:166](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L166)

##### model

> **model**: `string`

Defined in: [packages/core/src/core/types/index.ts:160](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L160)

##### text

> **text**: `string`

Defined in: [packages/core/src/core/types/index.ts:159](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L159)

##### usage?

> `optional` **usage**: `object`

Defined in: [packages/core/src/core/types/index.ts:161](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L161)

###### completion\_tokens

> **completion\_tokens**: `number`

###### prompt\_tokens

> **prompt\_tokens**: `number`

###### total\_tokens

> **total\_tokens**: `number`

***

### LLMStructuredResponse

Defined in: [packages/core/src/core/types/index.ts:32](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L32)

#### Properties

##### actions

> **actions**: [`CoTAction`](Types.md#cotaction)[]

Defined in: [packages/core/src/core/types/index.ts:40](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L40)

##### meta?

> `optional` **meta**: `object`

Defined in: [packages/core/src/core/types/index.ts:34](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L34)

###### requirements?

> `optional` **requirements**: `object`

###### requirements.population?

> `optional` **population**: `number`

###### requirements.resources?

> `optional` **resources**: `Record`\<`string`, `number`\>

##### plan?

> `optional` **plan**: `string`

Defined in: [packages/core/src/core/types/index.ts:33](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L33)

***

### LLMValidationOptions\<T\>

Defined in: [packages/core/src/core/types/index.ts:233](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L233)

#### Type Parameters

• **T**

#### Properties

##### llmClient

> **llmClient**: [`LLMClient`](../globals.md#llmclient-1)

Defined in: [packages/core/src/core/types/index.ts:239](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L239)

##### logger

> **logger**: [`Logger`](../globals.md#logger-1)

Defined in: [packages/core/src/core/types/index.ts:240](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L240)

##### maxRetries?

> `optional` **maxRetries**: `number`

Defined in: [packages/core/src/core/types/index.ts:237](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L237)

##### onRetry()?

> `optional` **onRetry**: (`error`, `attempt`) => `void`

Defined in: [packages/core/src/core/types/index.ts:238](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L238)

###### Parameters

###### error

`Error`

###### attempt

`number`

###### Returns

`void`

##### prompt

> **prompt**: `string`

Defined in: [packages/core/src/core/types/index.ts:234](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L234)

##### schema

> **schema**: `ZodType`\<`T`, `T`\>

Defined in: [packages/core/src/core/types/index.ts:236](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L236)

##### systemPrompt

> **systemPrompt**: `string`

Defined in: [packages/core/src/core/types/index.ts:235](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L235)

***

### LogEntry

Defined in: [packages/core/src/core/types/index.ts:66](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L66)

#### Properties

##### context

> **context**: `string`

Defined in: [packages/core/src/core/types/index.ts:69](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L69)

##### data?

> `optional` **data**: `any`

Defined in: [packages/core/src/core/types/index.ts:71](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L71)

##### level

> **level**: [`LogLevel`](Types.md#loglevel)

Defined in: [packages/core/src/core/types/index.ts:67](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L67)

##### message

> **message**: `string`

Defined in: [packages/core/src/core/types/index.ts:70](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L70)

##### timestamp

> **timestamp**: `Date`

Defined in: [packages/core/src/core/types/index.ts:68](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L68)

***

### LoggerConfig

Defined in: [packages/core/src/core/types/index.ts:58](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L58)

#### Properties

##### enableColors?

> `optional` **enableColors**: `boolean`

Defined in: [packages/core/src/core/types/index.ts:61](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L61)

##### enableTimestamp?

> `optional` **enableTimestamp**: `boolean`

Defined in: [packages/core/src/core/types/index.ts:60](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L60)

##### level

> **level**: [`LogLevel`](Types.md#loglevel)

Defined in: [packages/core/src/core/types/index.ts:59](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L59)

##### logPath?

> `optional` **logPath**: `string`

Defined in: [packages/core/src/core/types/index.ts:63](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L63)

##### logToFile?

> `optional` **logToFile**: `boolean`

Defined in: [packages/core/src/core/types/index.ts:62](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L62)

***

### Memory

Defined in: [packages/core/src/core/types/index.ts:398](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L398)

#### Properties

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:401](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L401)

##### embedding?

> `optional` **embedding**: `number`[]

Defined in: [packages/core/src/core/types/index.ts:404](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L404)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:399](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L399)

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:403](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L403)

##### roomId

> **roomId**: `string`

Defined in: [packages/core/src/core/types/index.ts:400](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L400)

##### timestamp

> **timestamp**: `Date`

Defined in: [packages/core/src/core/types/index.ts:402](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L402)

***

### Output\<T\>

Defined in: [packages/core/src/core/types/index.ts:380](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L380)

Interface for defining output handlers that can be registered with the Core system.

#### Type Parameters

• **T** = `unknown`

The type of data the output handler accepts

#### Properties

##### handler()

> **handler**: (`data`) => `Promise`\<`unknown`\>

Defined in: [packages/core/src/core/types/index.ts:384](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L384)

Handler function that processes the output data

###### Parameters

###### data

`T`

###### Returns

`Promise`\<`unknown`\>

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:382](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L382)

Unique identifier for this output

##### schema

> **schema**: `ZodType`\<`T`, `T`\>

Defined in: [packages/core/src/core/types/index.ts:386](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L386)

Zod schema for validating the input data

***

### PlanningStep

Defined in: [packages/core/src/core/types/index.ts:99](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L99)

#### Extends

- [`BaseStep`](Types.md#basestep)

#### Properties

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:79](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L79)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`content`](Types.md#content-1)

##### facts

> **facts**: `string`

Defined in: [packages/core/src/core/types/index.ts:102](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L102)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:77](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L77)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`id`](Types.md#id-1)

##### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:82](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L82)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`meta`](Types.md#meta-1)

##### plan

> **plan**: `string`

Defined in: [packages/core/src/core/types/index.ts:101](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L101)

##### tags?

> `optional` **tags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:81](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L81)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`tags`](Types.md#tags-1)

##### timestamp

> **timestamp**: `number`

Defined in: [packages/core/src/core/types/index.ts:80](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L80)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`timestamp`](Types.md#timestamp-1)

##### type

> **type**: `"planning"`

Defined in: [packages/core/src/core/types/index.ts:100](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L100)

###### Overrides

[`BaseStep`](Types.md#basestep).[`type`](Types.md#type-1)

***

### ProcessedResult

Defined in: [packages/core/src/core/types/index.ts:280](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L280)

#### Properties

##### alreadyProcessed?

> `optional` **alreadyProcessed**: `boolean`

Defined in: [packages/core/src/core/types/index.ts:286](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L286)

##### content

> **content**: `any`

Defined in: [packages/core/src/core/types/index.ts:281](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L281)

##### enrichedContext

> **enrichedContext**: [`EnrichedContext`](Types.md#enrichedcontext)

Defined in: [packages/core/src/core/types/index.ts:283](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L283)

##### isOutputSuccess?

> `optional` **isOutputSuccess**: `boolean`

Defined in: [packages/core/src/core/types/index.ts:285](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L285)

##### metadata

> **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:282](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L282)

##### suggestedOutputs

> **suggestedOutputs**: [`SuggestedOutput`](Types.md#suggestedoutputt)\<`any`\>[]

Defined in: [packages/core/src/core/types/index.ts:284](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L284)

##### updateTasks?

> `optional` **updateTasks**: `object`[]

Defined in: [packages/core/src/core/types/index.ts:287](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L287)

###### confidence

> **confidence**: `number`

###### data?

> `optional` **data**: `any`

###### intervalMs

> **intervalMs**: `number`

###### name

> **name**: `string`

***

### RefinedGoal

Defined in: [packages/core/src/core/types/index.ts:225](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L225)

#### Properties

##### description

> **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:226](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L226)

##### horizon

> **horizon**: `"short"`

Defined in: [packages/core/src/core/types/index.ts:229](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L229)

##### priority

> **priority**: `number`

Defined in: [packages/core/src/core/types/index.ts:228](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L228)

##### requirements

> **requirements**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:230](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L230)

##### success\_criteria

> **success\_criteria**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:227](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L227)

***

### RoomMetadata

Defined in: [packages/core/src/core/types/index.ts:389](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L389)

#### Properties

##### createdAt

> **createdAt**: `Date`

Defined in: [packages/core/src/core/types/index.ts:393](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L393)

##### description?

> `optional` **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:391](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L391)

##### lastActive

> **lastActive**: `Date`

Defined in: [packages/core/src/core/types/index.ts:394](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L394)

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:395](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L395)

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:390](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L390)

##### participants

> **participants**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:392](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L392)

***

### SearchResult

Defined in: [packages/core/src/core/types/index.ts:43](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L43)

#### Properties

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:45](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L45)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:44](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L44)

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:47](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L47)

##### similarity

> **similarity**: `number`

Defined in: [packages/core/src/core/types/index.ts:46](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L46)

***

### StructuredAnalysis

Defined in: [packages/core/src/core/types/index.ts:187](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L187)

#### Properties

##### caveats

> **caveats**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:192](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L192)

##### conclusion

> **conclusion**: `string`

Defined in: [packages/core/src/core/types/index.ts:190](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L190)

##### confidenceLevel

> **confidenceLevel**: `number`

Defined in: [packages/core/src/core/types/index.ts:191](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L191)

##### reasoning

> **reasoning**: `string`

Defined in: [packages/core/src/core/types/index.ts:189](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L189)

##### summary

> **summary**: `string`

Defined in: [packages/core/src/core/types/index.ts:188](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L188)

***

### SuggestedOutput\<T\>

Defined in: [packages/core/src/core/types/index.ts:295](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L295)

#### Type Parameters

• **T**

#### Properties

##### confidence

> **confidence**: `number`

Defined in: [packages/core/src/core/types/index.ts:298](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L298)

##### data

> **data**: `T`

Defined in: [packages/core/src/core/types/index.ts:297](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L297)

##### name

> **name**: `string`

Defined in: [packages/core/src/core/types/index.ts:296](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L296)

##### reasoning

> **reasoning**: `string`

Defined in: [packages/core/src/core/types/index.ts:299](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L299)

***

### SystemStep

Defined in: [packages/core/src/core/types/index.ts:105](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L105)

#### Extends

- [`BaseStep`](Types.md#basestep)

#### Properties

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:79](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L79)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`content`](Types.md#content-1)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:77](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L77)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`id`](Types.md#id-1)

##### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:82](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L82)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`meta`](Types.md#meta-1)

##### systemPrompt

> **systemPrompt**: `string`

Defined in: [packages/core/src/core/types/index.ts:107](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L107)

##### tags?

> `optional` **tags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:81](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L81)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`tags`](Types.md#tags-1)

##### timestamp

> **timestamp**: `number`

Defined in: [packages/core/src/core/types/index.ts:80](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L80)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`timestamp`](Types.md#timestamp-1)

##### type

> **type**: `"system"`

Defined in: [packages/core/src/core/types/index.ts:106](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L106)

###### Overrides

[`BaseStep`](Types.md#basestep).[`type`](Types.md#type-1)

***

### TaskStep

Defined in: [packages/core/src/core/types/index.ts:110](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L110)

#### Extends

- [`BaseStep`](Types.md#basestep)

#### Properties

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:79](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L79)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`content`](Types.md#content-1)

##### id

> **id**: `string`

Defined in: [packages/core/src/core/types/index.ts:77](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L77)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`id`](Types.md#id-1)

##### meta?

> `optional` **meta**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:82](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L82)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`meta`](Types.md#meta-1)

##### tags?

> `optional` **tags**: `string`[]

Defined in: [packages/core/src/core/types/index.ts:81](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L81)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`tags`](Types.md#tags-1)

##### task

> **task**: `string`

Defined in: [packages/core/src/core/types/index.ts:112](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L112)

##### timestamp

> **timestamp**: `number`

Defined in: [packages/core/src/core/types/index.ts:80](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L80)

###### Inherited from

[`BaseStep`](Types.md#basestep).[`timestamp`](Types.md#timestamp-1)

##### type

> **type**: `"task"`

Defined in: [packages/core/src/core/types/index.ts:111](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L111)

###### Overrides

[`BaseStep`](Types.md#basestep).[`type`](Types.md#type-1)

***

### Thought

Defined in: [packages/core/src/core/types/index.ts:321](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L321)

#### Properties

##### confidence

> **confidence**: `number`

Defined in: [packages/core/src/core/types/index.ts:323](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L323)

##### content

> **content**: `string`

Defined in: [packages/core/src/core/types/index.ts:322](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L322)

##### context?

> `optional` **context**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:324](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L324)

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>

Defined in: [packages/core/src/core/types/index.ts:328](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L328)

##### roomId?

> `optional` **roomId**: `string`

Defined in: [packages/core/src/core/types/index.ts:329](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L329)

##### source

> **source**: `string`

Defined in: [packages/core/src/core/types/index.ts:327](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L327)

##### timestamp

> **timestamp**: `Date`

Defined in: [packages/core/src/core/types/index.ts:325](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L325)

##### type

> **type**: `string`

Defined in: [packages/core/src/core/types/index.ts:326](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L326)

***

### ThoughtTemplate

Defined in: [packages/core/src/core/types/index.ts:339](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L339)

#### Properties

##### description

> **description**: `string`

Defined in: [packages/core/src/core/types/index.ts:341](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L341)

##### prompt

> **prompt**: `string`

Defined in: [packages/core/src/core/types/index.ts:342](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L342)

##### temperature

> **temperature**: `number`

Defined in: [packages/core/src/core/types/index.ts:343](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L343)

##### type

> **type**: [`ThoughtType`](Types.md#thoughttype)

Defined in: [packages/core/src/core/types/index.ts:340](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L340)

***

### VectorDB

Defined in: [packages/core/src/core/types/index.ts:407](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L407)

#### Methods

##### delete()

> **delete**(`id`): `Promise`\<`void`\>

Defined in: [packages/core/src/core/types/index.ts:416](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L416)

###### Parameters

###### id

`string`

###### Returns

`Promise`\<`void`\>

##### findSimilar()

> **findSimilar**(`content`, `limit`?, `metadata`?): `Promise`\<[`SearchResult`](Types.md#searchresult)[]\>

Defined in: [packages/core/src/core/types/index.ts:408](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L408)

###### Parameters

###### content

`string`

###### limit?

`number`

###### metadata?

`Record`\<`string`, `any`\>

###### Returns

`Promise`\<[`SearchResult`](Types.md#searchresult)[]\>

##### findSimilarDocuments()

> **findSimilarDocuments**(`query`, `limit`?): `Promise`\<[`Documentation`](Types.md#documentation)[]\>

Defined in: [packages/core/src/core/types/index.ts:442](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L442)

###### Parameters

###### query

`string`

###### limit?

`number`

###### Returns

`Promise`\<[`Documentation`](Types.md#documentation)[]\>

##### findSimilarEpisodes()

> **findSimilarEpisodes**(`action`, `limit`?): `Promise`\<[`EpisodicMemory`](Types.md#episodicmemory)[]\>

Defined in: [packages/core/src/core/types/index.ts:435](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L435)

###### Parameters

###### action

`string`

###### limit?

`number`

###### Returns

`Promise`\<[`EpisodicMemory`](Types.md#episodicmemory)[]\>

##### findSimilarInRoom()

> **findSimilarInRoom**(`content`, `roomId`, `limit`?, `metadata`?): `Promise`\<[`SearchResult`](Types.md#searchresult)[]\>

Defined in: [packages/core/src/core/types/index.ts:424](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L424)

###### Parameters

###### content

`string`

###### roomId

`string`

###### limit?

`number`

###### metadata?

`Record`\<`string`, `any`\>

###### Returns

`Promise`\<[`SearchResult`](Types.md#searchresult)[]\>

##### getRecentEpisodes()

> **getRecentEpisodes**(`limit`?): `Promise`\<[`EpisodicMemory`](Types.md#episodicmemory)[]\>

Defined in: [packages/core/src/core/types/index.ts:439](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L439)

###### Parameters

###### limit?

`number`

###### Returns

`Promise`\<[`EpisodicMemory`](Types.md#episodicmemory)[]\>

##### getSystemMetadata()

> **getSystemMetadata**(`key`): `Promise`\<`null` \| `Record`\<`string`, `any`\>\>

Defined in: [packages/core/src/core/types/index.ts:432](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L432)

###### Parameters

###### key

`string`

###### Returns

`Promise`\<`null` \| `Record`\<`string`, `any`\>\>

##### purge()

> **purge**(): `Promise`\<`void`\>

Defined in: [packages/core/src/core/types/index.ts:452](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L452)

###### Returns

`Promise`\<`void`\>

##### searchDocumentsByTag()

> **searchDocumentsByTag**(`tags`, `limit`?): `Promise`\<[`Documentation`](Types.md#documentation)[]\>

Defined in: [packages/core/src/core/types/index.ts:446](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L446)

###### Parameters

###### tags

`string`[]

###### limit?

`number`

###### Returns

`Promise`\<[`Documentation`](Types.md#documentation)[]\>

##### store()

> **store**(`content`, `metadata`?): `Promise`\<`void`\>

Defined in: [packages/core/src/core/types/index.ts:414](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L414)

###### Parameters

###### content

`string`

###### metadata?

`Record`\<`string`, `any`\>

###### Returns

`Promise`\<`void`\>

##### storeDocument()

> **storeDocument**(`doc`): `Promise`\<`string`\>

Defined in: [packages/core/src/core/types/index.ts:441](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L441)

###### Parameters

###### doc

`Omit`\<[`Documentation`](Types.md#documentation), `"id"`\>

###### Returns

`Promise`\<`string`\>

##### storeEpisode()

> **storeEpisode**(`memory`): `Promise`\<`string`\>

Defined in: [packages/core/src/core/types/index.ts:434](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L434)

###### Parameters

###### memory

`Omit`\<[`EpisodicMemory`](Types.md#episodicmemory), `"id"`\>

###### Returns

`Promise`\<`string`\>

##### storeInRoom()

> **storeInRoom**(`content`, `roomId`, `metadata`?): `Promise`\<`void`\>

Defined in: [packages/core/src/core/types/index.ts:418](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L418)

###### Parameters

###### content

`string`

###### roomId

`string`

###### metadata?

`Record`\<`string`, `any`\>

###### Returns

`Promise`\<`void`\>

##### storeSystemMetadata()

> **storeSystemMetadata**(`key`, `value`): `Promise`\<`void`\>

Defined in: [packages/core/src/core/types/index.ts:431](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L431)

###### Parameters

###### key

`string`

###### value

`Record`\<`string`, `any`\>

###### Returns

`Promise`\<`void`\>

##### updateDocument()

> **updateDocument**(`id`, `updates`): `Promise`\<`void`\>

Defined in: [packages/core/src/core/types/index.ts:450](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L450)

###### Parameters

###### id

`string`

###### updates

`Partial`\<[`Documentation`](Types.md#documentation)\>

###### Returns

`Promise`\<`void`\>

## Type Aliases

### GoalStatus

> **GoalStatus**: `"pending"` \| `"active"` \| `"completed"` \| `"failed"` \| `"ready"` \| `"blocked"`

Defined in: [packages/core/src/core/types/index.ts:118](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L118)

***

### HorizonType

> **HorizonType**: `"long"` \| `"medium"` \| `"short"`

Defined in: [packages/core/src/core/types/index.ts:117](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L117)

***

### Step

> **Step**: [`ActionStep`](Types.md#actionstep) \| [`PlanningStep`](Types.md#planningstep) \| [`SystemStep`](Types.md#systemstep) \| [`TaskStep`](Types.md#taskstep)

Defined in: [packages/core/src/core/types/index.ts:115](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L115)

***

### StepType

> **StepType**: `"action"` \| `"planning"` \| `"system"` \| `"task"`

Defined in: [packages/core/src/core/types/index.ts:74](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L74)

***

### ThoughtType

> **ThoughtType**: `"social_share"` \| `"research"` \| `"analysis"` \| `"alert"` \| `"inquiry"`

Defined in: [packages/core/src/core/types/index.ts:332](https://github.com/daydreamsai/daydreams/blob/e2cf9e17e0eefa9ff2799fbebfec204063c42935/packages/core/src/core/types/index.ts#L332)
