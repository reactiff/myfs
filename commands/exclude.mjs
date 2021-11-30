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

// function add(item) {
  
//   const encoded =  encodeURIComponent(item.replace(/\\\\/g, '\\'));

//   const items = store.get('exclude') || [];
//   if (items.includes(encoded)) {
//     console.log(chalk.yellow('Pattern already exists:'), encoded);
//     process.exit();  
//   }

//   items.push(encoded);
//   store.set('exclude', items);

//   console.log(chalk.yellow('Pattern added:'), item);
//   process.exit();
// }


// function del(item) {
  
//   debugger
//   const encoded =  encodeURIComponent(item.replace(/\\\\/g, '\\'));

//   let items = store.get('exclude') || [];
//   if (!items.includes(encoded)) {
//     console.error(chalk.red('Pattern not registered: '), item);
//     process.exit();
//   }

//   const index = items.findIndex(x => x === encoded);
//   items.splice(index, 1);
//   store.set('exclude', items);

//   console.log(chalk.yellow('Pattern deleted:'), item);
//   process.exit();
// }