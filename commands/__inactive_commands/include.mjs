import store from "utils/store/index.mjs";
import _ from 'lodash';

export const options = {
  'A': {
    alias: 'add',
    description: 'Add pattern',
    type: 'boolean',
  },
  'D': {
    alias: 'delete',
    description: 'Delete pattern',
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
export const desc = `Manage included file patterns (globs)`;
export const group = 'Settings';

export async function execute(context) {
  try {

    const { argv } = context;

    if (argv.A||argv.add) {
      store.add('include', argv.A||argv.add);
    }

    if (argv.R||argv.remove) {
      store.remove('include', argv.R||argv.remove);
    }

    if (argv.C||argv.clear) {
      store.clear('include', []);
    }

    if (argv.H||argv.hist) {
      store.hist('include', );

      process.exit();
    }

    if (argv.U||argv.undo) {
      store.revert('include');
    }

    store.show('include', (item) => decodeURIComponent(item));
    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
