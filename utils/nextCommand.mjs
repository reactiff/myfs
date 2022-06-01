import { parseCommandContext } from "./commandContext.mjs";
import inspectErrorStack from "./inspectErrorStack.mjs";
import yargs from "yargs";
import remap from "./remap.mjs";
import { printHelp } from "./help.mjs";
import chalk from "chalk";
import { Tracer } from "./Tracer.mjs";

export async function nextCommand(currentContext, depth, initArgs) {
  const d = currentContext ? currentContext.depth : depth;
  const cmdName = currentContext ? currentContext.args[d] : initArgs[d];

  const tracer = new Tracer(cmdName).enter();

  // parse context
  const context = await parseCommandContext(currentContext, depth, initArgs);

  // is there a command?
  if (!context.command) {
    printHelp(null, null, context);
    tracer.exit("no command, help needed");
    return;
  }

  // if command is not tail, call nextCommand recursively.
  if (context.tail !== undefined && context.commandName !== context.tail) {
    debugger;

    await nextCommand({
      ...context,
      getNextCommand: context.command.getNextCommand,
    }).catch((err) => {
      throw new Error(err.message || err);
    });

    tracer.exit("responsibility passed to a subcommand");
    return;
  }

  // call commandHandler (in commandLoader.mjs)
  const args = context.args.length > 0 ? context.args.slice(context.depth) : ["fs"];
  
  const m = context.module;

  try {
    yargs(args)
      .command(m)
      .describe(remap(m.options, {
        key: (v) => v.alias,
        value: (v) => v.description,
      }))
      .argv;
  } catch (ex) {
    console.log(ex);
    debugger;
  }

  // bootstrap command module
  // context
  //   .loadModule()
  //   .then((m) => {})
  //   .catch((err) => {
  //     inspectErrorStack(err);
  //   });
}
