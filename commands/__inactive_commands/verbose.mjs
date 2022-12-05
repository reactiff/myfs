import store from "utils/store/index.mjs";
import chalk from "chalk";
import { printToConsole } from "utils/printToConsole.mjs";

// COMMAND MODULE PROPS
export const desc = `Toggle verbosity`;
export const group = 'Settings';

export async function execute(context) {
  try {

    const { args, argv } = context;

    // const param = args[0];
    const stored = Boolean(store.get("verbose"));
    const value = !stored;

    // Do your thing!
    store.set('verbose', value);

    if (value) {
      printToConsole(chalk.cyan("verbose: true"));
    } else {
      printToConsole(chalk.gray("verbose: false"));
    }

    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
