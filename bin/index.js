#!/usr/bin/env node
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import _ from "lodash";
import { nextCommand } from "../utils/nextCommand.mjs";
import inspectErrorStack from "../utils/inspectErrorStack.mjs";

// chalk.level = 3;

const args = hideBin(process.argv);

nextCommand(null, 0, args).catch((err) => {
  inspectErrorStack(err);
});
