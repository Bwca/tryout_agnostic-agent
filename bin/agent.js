#!/usr/bin/env node
// @ts-check
/**
 * Command-line entry point: build an agent for the chosen provider and ask it
 * questions. Uses only the public API in src/index.js.
 *
 * Run:
 *   node bin/agent.js                                   (mock provider, offline)
 *   node bin/agent.js --provider ollama "What time is it in Istanbul?"
 *   node bin/agent.js --provider claude "Roll 3 dice."
 *   node bin/agent.js --provider openai --model <model-name> "Roll 3 dice."
 *   node bin/agent.js --provider ollama --chat
 */

import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { createAgent, isProviderName, PROVIDERS, TOOLS } from "../src/index.js";

/** @typedef {import("../src/index.js").ToolCallListener} ToolCallListener */

const DEFAULT_QUESTION = "What time is it in Istanbul and Vancouver? Then roll 3 dice.";
const SYSTEM_PROMPT = "You are a helpful assistant. Use the tools when they help answer.";

/** @type {ToolCallListener} */
const showToolCall = (call, result) =>
  console.log(`  [tool] ${call.name}(${JSON.stringify(call.arguments)}) -> ${result.content}`);

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    provider: { type: "string", default: "mock" },
    model: { type: "string" },
    chat: { type: "boolean", default: false },
  },
});

if (!isProviderName(values.provider)) {
  console.error(`Unknown provider '${values.provider}'. Choose from: ${Object.keys(PROVIDERS).join(", ")}.`);
  process.exit(2);
}

/** @param {import("../src/index.js").ProviderName} provider */
async function main(provider) {
  const agent = createAgent(provider, { tools: TOOLS, model: values.model, system: SYSTEM_PROMPT });
  console.log(`Provider: ${provider}   Model: ${agent.model}\n`);

  if (!values.chat) {
    console.log(await agent.run(positionals.join(" ") || DEFAULT_QUESTION, showToolCall));
  } else {
    console.log("Chat mode. Type 'quit' or press Ctrl+D to stop.");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.on("close", () => process.exit(0));
    while (true) {
      const question = (await rl.question("\nyou> ")).trim();
      if (["quit", "exit"].includes(question.toLowerCase())) break;
      if (question) console.log(`agent> ${await agent.run(question, showToolCall)}`);
    }
    rl.close();
  }
}

// Expected failures (missing API key, no model, network errors) print one line, not a stack trace.
main(values.provider).catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
