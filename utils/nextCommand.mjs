import { parseCommandContext } from "./commandContext.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import yargs from "yargs";
import remap from "./remap.mjs";

/**
 * Replacement for delegate()
 */

export function nextCommand(currentContext, depth, args) {
  return new Promise((resolve, reject) => {

    // parse context
    const context = parseCommandContext(currentContext, depth, args);

    // is there a command?
    if (!context.command) {
      return resolve(false);
    }

    // bootstrap command module
    context.loadModule()
      .then(m => {
        yargs(context.args)
          .command(m)
          .describe(remap(m.options, {
            key: v => v.alias,
            value: v => v.description
          }))
          .argv;
      })
      .catch((err) => {
        inspectErrorStack(err);
      });
  });
}
