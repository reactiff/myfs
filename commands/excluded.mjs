import _ from 'lodash';
import { GlobListStorage } from "utils/store/list.mjs";
import { StorageKeys } from "utils/store/StorageKeys.mjs";

export const options = {
  'A': {
    alias: 'add',
    description: 'Add pattern',
    type: 'boolean',
  },
  'D': {
    alias: 'delete',
    description: 'Remove pattern',
    type: 'boolean',
  },
  'C': {
    alias: 'clear',
    type: 'boolean',
  },
};

// COMMAND MODULE PROPS
export const help = `Manage excluded file patterns (globs)`;
export const group = 'Settings';

const store = new GlobListStorage(StorageKeys.ExcludedGlobs);

export async function execute(context) {
  try {

    const { argv } = context;

    if (argv.A||argv.add) {
      store.add('exclude', argv.A||argv.add);
    }

    if (argv.D||argv.delete) {
      store.delete('exclude', argv.D||argv.delete);
    }

    if (argv.C||argv.clear) {
      store.clear('exclude');
    }
    
    store.show( 'Excluded globs');
    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
