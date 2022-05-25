import { parseCommandContext } from "./commandContext.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import yargs from "yargs";
import remap from "./remap.mjs";

/**
 * Replacement for delegate()
 */
export function nextCommand(currentContext, depth, args) {
  return new Promise((resolve, reject) => {

    debugger

    // parse context
    const context = parseCommandContext(currentContext, depth, args);
    console.log(context.commandName);

    // is there a command?
    if (!context.command) {
      
      return resolve(false);
    }

    // if command is not tail, call nextCommand recursively.
    if (context.commandName !== context.tail) {
      nextCommand(currentContext)
        .then(resolve)
        .catch(reject);

      return;
    }

    // bootstrap command module
    context.loadModule()
      .then(m => {

        // call commandHandler (in commandLoader.mjs)

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
