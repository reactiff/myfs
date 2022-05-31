import { parseCommandContext } from "./commandContext.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import yargs from "yargs";
import remap from "./remap.mjs";
import { printHelp } from "./help.mjs";

export function nextCommand(currentContext, depth, args) {
  return new Promise((resolve, reject) => {

    // parse context
    const context = parseCommandContext(currentContext, depth, args);
    
    // is there a command?
    if (!context.command) {
      printHelp(null, null, context);
      return resolve(false);
    }

    // if command is not tail, call nextCommand recursively.
    if (context.tail !== undefined && context.commandName !== context.tail) {
      nextCommand(context)
        .then(x => {
          debugger
          resolve(x)
        })
        .catch(err => {
          debugger
          reject(err)
        });

      return;
    }

    // bootstrap command module
    context.loadModule()
      .then(m => {

        // call commandHandler (in commandLoader.mjs)
        const args = context.args.length > 0 
          ? context.args.slice(context.depth)
          : ['fs'];

        const optionsWithAliases = remap(m.options, {
            key: v => v.alias,
            value: v => v.description
          })

        try {

          yargs(args)
            .command(m)
            .describe(optionsWithAliases)
            .argv;

        }
        catch(ex) {
          debugger  
        }
      })
      .catch((err) => {
        inspectErrorStack(err);
      });
  });
}
