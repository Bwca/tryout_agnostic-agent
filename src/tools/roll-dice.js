// @ts-check
/** Tool: roll one or more dice. */

/** @typedef {import("../core/index.js").Tool} Tool */

/**
 * Roll `count` dice with `sides` sides each and return the results.
 * @param {{ sides?: number, count?: number }} args
 * @returns {string}
 */
export function rollDice({ sides = 6, count = 1 }) {
  if (!(sides >= 2 && sides <= 1000 && count >= 1 && count <= 100)) {
    throw new Error("sides must be 2-1000 and count must be 1-100.");
  }
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
  return `rolls=[${rolls.join(", ")}] total=${rolls.reduce((a, b) => a + b, 0)}`;
}

/** @type {Tool} */
export const rollDiceTool = {
  name: "roll_dice",
  description: "Roll one or more dice and return each roll and the total.",
  parameters: {
    type: "object",
    properties: {
      sides: { type: "integer", description: "Sides per die (default 6)." },
      count: { type: "integer", description: "How many dice (default 1)." },
    },
  },
  run: rollDice,
};
