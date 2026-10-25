// @ts-check
/**
 * A fake provider with no network and no SDK.
 *
 * It follows a fixed script: on the first turn it asks for every tool (with
 * no arguments), and on the next turn it "answers" by listing the results.
 * That is enough to exercise the whole Agent loop for free, which makes it
 * the simplest possible example of a provider, and handy for testing.
 */

import { Agent } from "../core/index.js";

/**
 * @typedef {import("../core/index.js").AgentOptions} AgentOptions
 * @typedef {import("../core/index.js").ToolResult} ToolResult
 * @typedef {import("../core/index.js").Turn} Turn
 */

/**
 * The mock's history format. Real providers use their API's format instead.
 * @typedef {{ role: "user", text: string }
 *   | { role: "assistant", turn: Turn }
 *   | { role: "tool", results: ToolResult[] }} MockMessage
 */

export class MockAgent extends Agent {
  /** @type {string | undefined} */
  static defaultModel = "mock";

  /** @param {AgentOptions} options */
  constructor(options) {
    super(options);
    /** @type {MockMessage[]} */
    this.messages = [];
  }

  /** @param {string} text */
  addUserMessage(text) {
    this.messages.push({ role: "user", text });
  }

  /** @returns {Promise<Turn>} */
  async callModel() {
    const last = this.messages.at(-1);
    /** @type {Turn} */
    const turn =
      last?.role === "tool"
        ? { text: `(mock) Tool results:\n${last.results.map((r) => `- ${r.content}`).join("\n")}`, toolCalls: [] }
        : {
            text: "",
            toolCalls: [...this.tools.keys()].map((name, i) => ({ id: `mock_${this.messages.length}_${i}`, name, arguments: {} })),
          };
    this.messages.push({ role: "assistant", turn });
    return turn;
  }

  /** @param {ToolResult[]} results */
  addToolResults(results) {
    this.messages.push({ role: "tool", results });
  }
}
