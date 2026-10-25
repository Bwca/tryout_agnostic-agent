// @ts-check
/** Local models via Ollama, which serves an OpenAI-compatible API on /v1. */

import OpenAI from "openai";
import { Agent } from "../index.js";

/**
 * @typedef {import("../core/index.js").AgentOptions} AgentOptions
 * @typedef {import("../core/index.js").ToolResult} ToolResult
 * @typedef {import("../core/index.js").Turn} Turn
 */

export class OllamaAgent extends Agent 
{
  /**
   * No default: OpenAI's model names change often, so pass one explicitly.
   * @type {string | undefined}
   */
  static defaultModel = "local-agent";

  /** @param {AgentOptions} options */
  constructor(options) {
    super(options);
    this.client = new OpenAI({ baseURL: this.baseURL(), apiKey: this.apiKey() });
    // OpenAI's tool format wraps the same JSON Schema in { type: "function", ... }.
    /** @type {OpenAI.Chat.ChatCompletionTool[]} */
    this.toolSpecs = options.tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
    /** @type {OpenAI.Chat.ChatCompletionMessageParam[]} */
    this.messages = [];
    // OpenAI puts the system prompt in the message list, not a separate field.
    if (this.system) this.messages.push({ role: "system", content: this.system });
  }

  /**
   * Where to send requests. Undefined means OpenAI's own servers.
   * @returns {string | undefined}
   */
  baseURL() {
        return process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
  }

  /** @returns {string} */
  apiKey() {
        return "ollama"; // Ollama ignores the key, but the client requires one

  }

  /** @param {string} text */
  addUserMessage(text) {
    this.messages.push({ role: "user", content: text });
  }

  /** @returns {Promise<Turn>} */
  async callModel() {
    const response = await this.client.chat.completions.create({
      model: this.model,
      tools: this.toolSpecs,
      messages: this.messages,
    });
    const message = response.choices[0].message;
    const calls = (message.tool_calls ?? []).filter((c) => c.type === "function");

    // Echo the assistant message back into history, including its tool calls.
    this.messages.push({
      role: "assistant",
      content: message.content ?? "",
      ...(calls.length > 0 && { tool_calls: calls }),
    });

    return {
      text: message.content ?? "",
      // Arguments arrive as a JSON string here, unlike Claude's ready-made object.
      toolCalls: calls.map((c) => ({ id: c.id, name: c.function.name, arguments: parseArgs(c.function.arguments) })),
    };
  }

  /** @param {ToolResult[]} results */
  addToolResults(results) {
    // One "tool" message per result. There is no error flag, so the
    // "Error: ..." text in the content is how the model finds out.
    for (const r of results) {
      this.messages.push({ role: "tool", tool_call_id: r.callId, content: r.content });
    }
  }
}


/**
 * Small local models sometimes produce empty or invalid JSON. Pass {} to the
 * tool in that case, which yields a readable error back to the model.
 * @param {string} raw
 * @returns {Record<string, unknown>}
 */
function parseArgs(raw) {
  try {
    const args = JSON.parse(raw || "{}");
    return args && typeof args === "object" && !Array.isArray(args) ? args : {};
  } catch {
    return {};
  }
}
