// @ts-check
/**
 * The domain model: the provider-neutral vocabulary every layer shares.
 *
 * This file only declares types (JSDoc typedefs) and has no runtime code.
 */

/**
 * A function plus the description a model needs to call it.
 * @typedef {object} Tool
 * @property {string} name
 * @property {string} description
 * @property {Record<string, unknown>} parameters JSON Schema for the arguments; every provider accepts this
 * @property {(args: any) => string | Promise<string>} run
 */

/**
 * The model asking to run one tool.
 * @typedef {object} ToolCall
 * @property {string} id Lets the provider match a result to its call
 * @property {string} name
 * @property {Record<string, unknown>} arguments Always a parsed object
 */

/**
 * The outcome of running one ToolCall, ready to send back to the model.
 * @typedef {object} ToolResult
 * @property {string} callId
 * @property {string} content
 * @property {boolean} isError
 */

/**
 * One reply from the model, in neutral form.
 * @typedef {object} Turn
 * @property {string} text
 * @property {ToolCall[]} toolCalls Empty means the model is done and `text` is the answer
 */

/**
 * @typedef {object} AgentOptions
 * @property {string} model
 * @property {Tool[]} tools
 * @property {string} [system]
 * @property {number} [maxTurns]
 */

/**
 * Called after each tool runs, e.g. to log progress.
 * @typedef {(call: ToolCall, result: ToolResult) => void} ToolCallListener
 */

export {};
