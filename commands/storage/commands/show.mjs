import store from "utils/store/index.mjs";
import _ from "lodash";
import { printBanner } from "utils/printBanner.mjs";
import columnify from "columnify";
import boxen from "boxen";
import chalk from "chalk";
import { printToConsole } from "utils/printToConsole.mjs";

// COMMAND MODULE PROPS
export const command = "show [keys..]"
export const desc = `Show storage content`;
export const group = "";
export const options = {};

//> fs storage show

export async function execute(context) {
  try {
    const { args, argv, depth } = context;
    
    const cmdLineParams = argv.keys;

    if (cmdLineParams && cmdLineParams.length > 0) {
      cmdLineParams.forEach((k) => {
        store.show(k);
      });
      return;
    }

    // CONTINUED FROM HERE WHEN KEYS ARE NOT PROVIDED
    
    const entries = Object.entries(store.all);
    const data = entries.map((kv) => ({
      key: kv[0], 
      contentType: typeof kv[1]
    }));

    // OUTPUT

    const content = entries.length === 0 
      ? chalk.gray("(empty)")
      : columnify(data);

      printToConsole();
      printToConsole(boxen(content, { 
      title: "Storage Index",
      dimBorder: true,
      textAlignment: 'center',
      padding: 1,
      borderStyle: 'round',
      showHeaders: false
    }));

    printToConsole();

    return;
  } catch (ex) {
    throw new Error(ex.message);
  }
}
