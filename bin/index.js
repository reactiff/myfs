#!/usr/bin/env node
import { hideBin } from "yargs/helpers";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import _ from "lodash";
import { nextCommand } from "utils/nextCommand.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";

/////////////////// bin/index ////////////////////

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__basedir = path.resolve(__dirname, "..");
chalk.level = 3;

const args = hideBin(process.argv);

nextCommand(null, 0, args).catch((err) => {
  inspectErrorStack(err);
});
