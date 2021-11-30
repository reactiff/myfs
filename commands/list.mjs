import store from "utils/store.mjs";
import _ from 'lodash';
import {assert} from 'utils/assert.mjs';

export const options = {
  'A': {
    alias: 'add',
    description: 'Add item',
    type: 'string',
  },
  'R': {
    alias: 'remove',
    description: 'Remove item',
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

export async function execute(args, argv, resolve, fsitem) {

  try {

    debugger

    const name = argv._[1];


    
    if (argv.A||argv.add) {
      assert(typeof argv.A||argv.add === 'string', 'item name got parsed as string');
      store.add(name, argv.A||argv.add);
    }

    if (argv.R||argv.remove) {
      store.remove(name, argv.R||argv.remove);
    }

    if (argv.C||argv.clear) {
      store.clear(name, []);
    }

    if (argv.H||argv.hist) {
      store.hist(name, );

      process.exit();
    }

    if (argv.U||argv.undo) {
      store.revert(name);
    }

    //

    store.show(name, (item) => decodeURIComponent(item));

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
