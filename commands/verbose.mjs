import store from "utils/store/index.mjs";
import chalk from "chalk";

// COMMAND MODULE PROPS
export const help = `Toggle verbosity`;
export const group = 'Settings';

export async function execute(args, argv, resolve) {
  try {

    const param = args[0];
    const stored = Boolean(store.get("verbose"));
    const value = param !== undefined && param !== null ? Boolean(param) : !stored;

    // Do your thing!
    store.set('verbose', value);

    if (value) {
      console.log(chalk.cyan("verbose: true"));
    } else {
      console.log(chalk.gray("verbose: false"));
    }

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
