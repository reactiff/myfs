#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import chalk from "chalk";
import commandLoader from "../utils/commandLoader.mjs";
import toDictionary from "../utils/toDictionary.mjs";
import inspectErrorStack from "../utils/inspectErrorStack.mjs";
////////////////////////
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootCommandsPath = path.resolve(__dirname, "../commands");
////////////////////////
global.__basedir = path.resolve(__dirname, "..");

chalk.level = 3;

const commands = commandLoader.list(rootCommandsPath);
const menu = toDictionary(commands, (cmd) => cmd.name);
const args = hideBin(process.argv);

// validate the name of next command
const cmd = args[0];
if (!Reflect.has(menu, cmd)) {
  console.error(
    chalk.red(cmd + " is not a valid command here.  Valid commands: " + commands.map((c) => c.name).join(" | "))
  );
  process.exit();
}

commandLoader
  .load(menu[cmd])
  .then((modules) => {
    yargs(args).command(modules).argv;
  })
  .catch((err) => {
    inspectErrorStack(err);
  });
