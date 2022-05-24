#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
////////////////////////////////////
import commandLoader from "../utils/commandLoader.mjs";
import inspectErrorStack from "../utils/inspectErrorStack.mjs";
import remap from "../utils/remap.mjs";
import _ from "lodash";
import { parseCommandContext } from "utils/commandContext.mjs";
import { printHelp } from "utils/commandContext.mjs";
///////////////////////////////////////////////////////////////
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__basedir = path.resolve(__dirname, "..");

chalk.level = 3;

// command chain
const chain = hideBin(process.argv);

// command context
const context = parseCommandContext(0, chain);

// --help
if (context.flags.help && context.args.length===0 || !context.command) {
  printHelp(context);
}
else {
  // bootstrap command module
  context.loadModule()
  .then((module) => {
    yargs(context.args)
      .command(module)
      .describe(remap(module.options, { 
        key: v => v.alias, 
        value: v => v.description 
      }))
      .argv;
  })
  .catch((err) => {
    inspectErrorStack(err);
  });
}





