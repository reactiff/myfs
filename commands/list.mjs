import store from "utils/store/index.mjs";
import _ from 'lodash';
import {assert} from 'utils/assert.mjs';

export const options = {
  'A': {
    alias: 'add',
    description: 'Add item',
    type: 'string',
  },
  'D': {
    alias: 'delete',
    description: 'Delete item',
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
  'U': {
    alias: 'undo',
    type: 'boolean',
  },
};

// COMMAND MODULE PROPS
export const help = `Working with lists`;
export const group = 'List Management';

export async function execute(args, argv, resolve, fsitem) {

  try {

    debugger

    const name = argv._[1];


    
    if (argv.A||argv.add) {
      assert(typeof argv.A||argv.add === 'string', 'item name got parsed as string');
      store.add(name, argv.A||argv.add);
    }

    if (argv.D||argv.delete) {
      store.delete(name, argv.D||argv.delete);
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
