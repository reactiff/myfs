import store from "utils/store.mjs";
import chalk from "chalk";

export async function execute(args, argv, resolve) {
  try {
    const verbose = !(args[0] || store.get("verbose") === true);

    // Do your thing!
    store.set({ verbose });

    if (verbose) {
      console.log(chalk.cyan("verbose: true"));
    } else {
      console.log(chalk.gray("verbose: false"));
    }

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
