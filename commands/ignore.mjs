import _ from 'lodash';
import { ShowHelp } from 'utils/help.mjs';
import { GlobListStorage } from "utils/store/ListStorage.mjs";
import { StorageKeys } from "utils/store/StorageKeys.mjs";

export const options = {
  'S': {
    alias: 'show',
    description: 'Show ignore list',
    type: 'boolean',
  },
};

// COMMAND MODULE PROPS
export const help = `Manage excluded file patterns (globs)`;
export const group = 'Filtering';

const store = new GlobListStorage(StorageKeys.ExcludedGlobs);

export const getNextCommand = (ctx) => {
  debugger
  return store.getNextCommand(ctx);
}

export const getAvailableCommands = (ctx) => {
  debugger
  return store.getAvailableCommands(ctx);
}


export async function execute(context) {
  try {

    debugger

    const { argv } = context;
    
    return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message);
  }
}
