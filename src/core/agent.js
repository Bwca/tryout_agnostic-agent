// @ts-check
/**
 * The abstract Agent: the agent loop, written once for every provider.
 *
 * Nothing in this file mentions a specific provider. Each provider extends
 * `Agent` and implements three hook methods that translate between the
 * domain model (./types.js) and its own API format.
 */

/**
 * @typedef {import("./types.js").AgentOptions} AgentOptions
 * @typedef {import("./types.js").ToolCall} ToolCall
 * @typedef {import("./types.js").ToolCallListener} ToolCallListener
 * @typedef {import("./types.js").ToolResult} ToolResult
 * @typedef {import("./types.js").Turn} Turn
 */

/** @abstract */
export class Agent {
  /** @param {AgentOptions} options */
  constructor({ model, tools, system = "", maxTurns = 10 }) {
    if (new.target === Agent) throw new TypeError("Agent is abstract; use a provider subclass.");
    this.model = model;
    this.tools = new Map(tools.map((tool) => [tool.name, tool]));
    this.system = system;
    this.maxTurns = maxTurns;
    /**
     * Conversation history in the provider's own format. Only the subclass
     * reads or writes the entries.
     * @type {unknown[]}
     */
    this.messages = [];
  }

  // --- Hooks: each provider implements these three ------------------------

  /**
   * Append a user message to this.messages in the provider's format.
   * @abstract
   * @param {string} text
   * @returns {void}
   */
  addUserMessage(text) {
    throw new Error(`${this.constructor.name} must implement addUserMessage()`);
  }

  /**
   * Send this.messages to the model, append its reply, return it as a Turn.
   * @abstract
   * @returns {Promise<Turn>}
   */
  async callModel() {
    throw new Error(`${this.constructor.name} must implement callModel()`);
  }

  /**
   * Append the tool results to this.messages in the provider's format.
   * @abstract
   * @param {ToolResult[]} results
   * @returns {void}
   */
  addToolResults(results) {
    throw new Error(`${this.constructor.name} must implement addToolResults()`);
  }

  // --- The loop, shared by every provider ---------------------------------

  /**
   * Ask a question, let the model use tools as needed, return its final answer.
   *
   * History is kept between calls, so calling run() again continues the same
   * conversation.
   *
   * @param {string} question
   * @param {ToolCallListener} [onToolCall]
   * @returns {Promise<string>}
   */
  async run(question, onToolCall) {
    this.addUserMessage(question);
    for (let i = 0; i < this.maxTurns; i++) {
      const turn = await this.callModel();
      if (turn.toolCalls.length === 0) return turn.text;
      const results = await Promise.all(turn.toolCalls.map((call) => this.#execute(call)));
      turn.toolCalls.forEach((call, j) => onToolCall?.(call, results[j]));
      this.addToolResults(results);
    }
    return `(stopped after ${this.maxTurns} turns without a final answer)`;
  }

  /**
   * @param {ToolCall} call
   * @returns {Promise<ToolResult>}
   */
  async #execute(call) {
    const tool = this.tools.get(call.name);
    if (!tool) {
      return { callId: call.id, content: `Error: no tool named '${call.name}'.`, isError: true };
    }
    try {
      return { callId: call.id, content: String(await tool.run(call.arguments)), isError: false };
    } catch (e) {
      // Report the failure to the model so it can retry or explain.
      const message = e instanceof Error ? e.message : String(e);
      return { callId: call.id, content: `Error: ${message}`, isError: true };
    }
  }
}
