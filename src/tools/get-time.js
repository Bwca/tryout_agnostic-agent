// @ts-check
/** Tool: the current local time in any timezone. */

/** @typedef {import("../core/index.js").Tool} Tool */

/**
 * Return the current local time in an IANA timezone like "America/Vancouver".
 * @param {{ timezone?: string }} args
 * @returns {string}
 */
export function getTime({ timezone }) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date());
  } catch {
    throw new Error(`Unknown timezone '${timezone}'. Use a name like 'Europe/Istanbul'.`);
  }
}

/** @type {Tool} */
export const getTimeTool = {
  name: "get_time",
  description: "Get the current local date and time in a timezone.",
  parameters: {
    type: "object",
    properties: {
      timezone: {
        type: "string",
        description: "IANA timezone name, e.g. 'America/Vancouver' or 'Europe/Istanbul'.",
      },
    },
    required: ["timezone"],
  },
  run: getTime,
};
