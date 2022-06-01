import store from "utils/store/index.mjs";
import chalk from "chalk";

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
      console.log(chalk.cyan("verbose: true"));
    } else {
      console.log(chalk.gray("verbose: false"));
    }

    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
