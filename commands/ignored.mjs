import _ from 'lodash';
import { ShowHelp } from 'utils/help.mjs';
import { GlobListStorage } from "utils/store/GlobListStorage.mjs";
import { StorageKeys } from "utils/store/StorageKeys.mjs";

// COMMAND MODULE PROPS
export const desc = `Manage ignored file/path patterns (globs)`;
export const group = 'Filtering';

const store = new GlobListStorage(StorageKeys.IgnoredGlobs);

export const getSubcommand = (commandName) => {
  return store.getSubcommand(commandName);
}

export const getAvailableCommands = (ctx) => {
  return store.getAvailableCommands(ctx);
}


export async function execute(context) {
  try {

    const { argv } = context;
        
    store.show('Ignored globs');
    
    return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message);
  }
}
