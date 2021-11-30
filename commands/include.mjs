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

export async function execute(args, argv, resolve, fsitem) {

  try {

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

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}

// function add(item) {
  
//   const encoded =  encodeURIComponent(item.replace(/\\\\/g, '\\'));
  
//   const items = store.get('include') || [];
//   if (items.includes(encoded)) {
//     console.log(chalk.yellow('Pattern already exists:'), item);
//     process.exit();  
//   }

//   items.push(encoded);
//   store.set('include', items);

//   console.log(chalk.yellow('Pattern added:'), item);
//   process.exit();
// }


// function del(item) {
  
//   const encoded =  encodeURIComponent(item.replace(/\\\\/g, '\\'));

//   const items = store.get('include') || [];
//   if (!items.includes(encoded)) {
//     console.error(chalk.red('Pattern not registered: '), item);
//     process.exit();
//   }

//   const index = items.findIndex(x => x === encoded);
//   items.splice(index, 1);
//   store.set('include', items);

//   console.log(chalk.yellow('Pattern deleted:'), item);
//   process.exit();
// }
