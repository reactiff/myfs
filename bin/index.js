#!/usr/bin/env node
import { hideBin } from "yargs/helpers";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import _ from "lodash";
////////////////////////////////////
import { nextCommand } from "utils/nextCommand.mjs";
import { parseCommandContext } from "utils/commandContext.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";

/////////////////// bin/index ////////////////////

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__basedir = path.resolve(__dirname, "..");

chalk.level = 3;

// command chain
const args = hideBin(process.argv);

// command context
// const context = parseCommandContext(null, 0, args);

// --help
// if (context.flags.help && context.args.length===0 || !context.command) {
//   printHelp(context);
//   process.exit();
// }

nextCommand(null, 0, args)
  .catch(err => {
    inspectErrorStack(err);
  })



