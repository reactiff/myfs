import store from "utils/store/index.mjs";
import _ from 'lodash';
// import { EXISTS, NEXISTS } from "utils/special-chars/set-theory.mjs";
import { ShowHelp } from "utils/help.mjs";
import chalk from "chalk";

// COMMAND MODULE PROPS

export const command = 'delete <key> <repeatedKey>';
export const desc = `Delete existing key`;
export const group = 'Storage';

export async function execute(context) {
  try {

    const { args, argv } = context;

    if (argv.key !== argv.repeatedKey) return ShowHelp;
    
    store.erase(argv.key);
    
    console.log( chalk.bgYellow.black('Permanently deleted storage entry for key: ' + argv.key));
    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
