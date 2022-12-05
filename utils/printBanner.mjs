import chalk from "chalk";
import { createRequire } from "module";
import { printToConsole } from "./printToConsole.mjs";

const require = createRequire(import.meta.url);
const boxen = require("boxen");

export const printBanner = (text, options = {}) => {
  const content = boxen(text, {
    padding: options.padding || 1,
    borderColor: options.borderColor || '#808080',
    backgroundColor: options.backgroundColor || options.bgColor || undefined,
    margin: options.margin || 0
  });
  printToConsole( chalk.bold(content) );
};
