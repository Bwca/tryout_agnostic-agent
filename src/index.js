// @ts-check
/**
 * The package's public API. Code outside src/ (the CLI, tests, your own
 * scripts) imports from here and nowhere else in src/.
 */

export { Agent } from "./core/index.js";
export { createAgent, isProviderName, PROVIDERS } from "./factory.js";
export { TOOLS } from "./tools/index.js";

/**
 * @typedef {import("./core/index.js").AgentOptions} AgentOptions
 * @typedef {import("./core/index.js").Tool} Tool
 * @typedef {import("./core/index.js").ToolCall} ToolCall
 * @typedef {import("./core/index.js").ToolCallListener} ToolCallListener
 * @typedef {import("./core/index.js").ToolResult} ToolResult
 * @typedef {import("./core/index.js").Turn} Turn
 * @typedef {import("./factory.js").ProviderName} ProviderName
 */
