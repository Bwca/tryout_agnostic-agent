// @ts-check
/**
 * The factory: turns a provider name into a ready-to-use Agent.
 *
 * This is the only module that knows the full list of providers.
 */

import { MockAgent, OllamaAgent } from "./providers/index.js";

/**
 * @typedef {import("./core/index.js").Agent} Agent
 * @typedef {import("./core/index.js").Tool} Tool
 */

// To add a provider: write an Agent subclass in providers/ and register it here.
export const PROVIDERS = {
  mock: MockAgent,
  ollama: OllamaAgent,
};

/** @typedef {keyof typeof PROVIDERS} ProviderName */

/**
 * @param {string} name
 * @returns {name is ProviderName}
 */
export function isProviderName(name) {
  return Object.hasOwn(PROVIDERS, name);
}

/**
 * Build an agent for `provider`, using its default model unless `model` is given.
 * @param {ProviderName} provider
 * @param {{ tools: Tool[], model?: string, system?: string, maxTurns?: number }} options
 * @returns {Agent}
 */
export function createAgent(provider, { tools, model, system, maxTurns }) {
  if (!isProviderName(provider)) {
    throw new Error(`Unknown provider '${provider}'. Choose from: ${Object.keys(PROVIDERS).join(", ")}.`);
  }
  const AgentClass = PROVIDERS[provider];
  const chosenModel = model ?? AgentClass.defaultModel;
  if (!chosenModel) {
    throw new Error(`Provider '${provider}' has no default model; pass one with --model.`);
  }
  return new AgentClass({ model: chosenModel, tools, system, maxTurns });
}
