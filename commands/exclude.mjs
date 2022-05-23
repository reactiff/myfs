import store from "utils/store.mjs";
import _ from 'lodash';

export const options = {
  'A': {
    alias: 'add',
    description: 'Add pattern',
    type: 'boolean',
  },
  'R': {
    alias: 'remove',
    description: 'Remove pattern',
    type: 'boolean',
  },
  'C': {
    alias: 'clear',
    type: 'boolean',
  },
  'H': {
    alias: 'hist',
    type: 'boolean',
  },
  'R': {
    alias: 'revert',
    type: 'boolean',
  },
};

// COMMAND MODULE PROPS
export const help = `Manage excluded file patterns (globs)`;
export const group = 'Settings';

export async function execute(args, argv, resolve, fsitem) {
  try {

    if (argv.A||argv.add) {
      store.add('exclude', argv.A||argv.add);
    }

    if (argv.R||argv.remove) {
      store.remove('exclude', argv.R||argv.remove);
    }

    if (argv.C||argv.clear) {
      store.clear('exclude');
    }

    if (argv.H||argv.hist) {
      store.hist('exclude');
    }

    if (argv.R||argv.revert) {
      store.revert('exclude');
    }

    store.show('exclude', item => decodeURIComponent(item));

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
