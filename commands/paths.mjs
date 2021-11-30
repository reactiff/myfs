import store from "utils/store.mjs";
import _ from 'lodash';
import path from 'path';
import chalk from 'chalk'
import fs from 'fs';

export const options = {
  'A': {
    alias: 'add',
    description: 'Add path',
    type: 'boolean',
    demand: false,
  },
  'D': {
    alias: 'delete',
    description: 'Delete path',
    type: 'boolean',
    demand: false,
  },

};

export async function execute(args, argv, resolve, fsitem) {
  try {

    if (argv.A||argv.add) {
      addPath(argv.A||argv.add);
    }

    if (argv.D||argv.delete) {
      deletePath(argv.D||argv.delete);
    }

    const items = store.get('paths') || [];
    console.group(chalk.yellow('PATHS:'))
    for (let p of items) {
      console.log(p);
    }
    
    console.log();

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}

function addPath(pathToAdd) {
  
  pathToAdd = path.resolve(pathToAdd);

  if (!fs.existsSync(pathToAdd)) {
    console.error(chalk.red('Invalid path: '), pathToAdd);
    process.exit();
  }

  const paths = store.get('paths') || [];
  if (paths.includes(pathToAdd)) {
    console.log(chalk.yellow('Path already exists:'), pathToAdd);
    process.exit();  
  }

  paths.push(pathToAdd);
  store.set('paths', paths);

  console.log(chalk.yellow('Path added:'), pathToAdd);
  process.exit();
}


function deletePath(p) {
  
  const paths = store.get('paths') || [];
  if (!paths.includes(p)) {
    console.error(chalk.red('Path not registered: '), p);
    process.exit();
  }

  debugger

  const index = paths.findIndex(x => x === p);
  paths.splice(index, 1);
  store.set('paths', paths);

  console.log(chalk.yellow('Path deleted:'), p);
  process.exit();
}