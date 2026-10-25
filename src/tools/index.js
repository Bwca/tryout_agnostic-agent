// @ts-check
/**
 * Public surface of the tools layer: the agent's tools, one file per tool.
 *
 * Tools are provider-neutral. The model only ever sees each tool's `name`,
 * `description` and `parameters`, never the code in `run`.
 */

import { getTimeTool } from "./get-time.js";
import { rollDiceTool } from "./roll-dice.js";

export { getTime, getTimeTool } from "./get-time.js";
export { rollDice, rollDiceTool } from "./roll-dice.js";

/** @type {import("../core/index.js").Tool[]} */
export const TOOLS = [getTimeTool, rollDiceTool];
