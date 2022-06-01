import store from "utils/store/index.mjs";
import _ from "lodash";
import { printBanner } from "utils/printBanner.mjs";
import columnify from "columnify";
import boxen from "boxen";
import chalk from "chalk";

// COMMAND MODULE PROPS
export const help = `Show storage content`;
export const group = "";
export const options = {};

export async function execute(context) {
  try {
    const { args, argv, depth } = context;
    const cmdLineParams = args.slice(depth + 1);

    if (cmdLineParams.length > 1) {
      cmdLineParams.forEach((k) => {
        store.show(k);
      });
      return;
    }
    
    const entries = Object.entries(store.all);
    const data = entries.map((kv) => ({
      key: kv[0], 
      contentType: typeof kv[1]
    }));

    // OUTPUT

    const content = entries.length === 0 
      ? chalk.gray("(empty)")
      : columnify(data);

    console.log();
    console.log(boxen(content, { 
      title: "Storage Index",
      dimBorder: true,
      textAlignment: 'center',
      padding: 1,
      borderStyle: 'round'
    }));

    console.log();

    return;
  } catch (ex) {
    throw new Error(ex.message);
  }
}
