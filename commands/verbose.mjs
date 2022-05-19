import store from "utils/store.mjs";
import chalk from "chalk";

export async function execute(args, argv, resolve) {
  try {

    const param = args[0];
    const stored = Boolean(store.get("verbose"));

    // console.log('param', param);
    // console.log('stored', stored);

    const value = param !== undefined && param !== null ? Boolean(param) : !stored;

    // console.log('new value', value);

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
