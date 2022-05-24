import store from "utils/store.mjs";
import _ from 'lodash';
import path from 'path';
import chalk from 'chalk'
import fs from 'fs';
import { parseOptions } from "utils/parseOptions";
import { PathListStorage } from "utils/store/list";

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
  'C': {
    alias: 'clear',
    description: 'Clear all paths',
    type: 'boolean',
    demand: false,
  },

};

// COMMAND MODULE PROPS
export const help = `Manage working paths`;
export const group = 'Settings';

export async function execute(args, argv, resolve, fsitem) {
  try {
    
    parseOptions(argv, options);

    const pathStorage = new PathListStorage();

    if (argv.add) {
      pathStorage.add(argv.add);
      return resolve();
    }

    if (argv.delete) {
      pathStorage.delete(argv.delete);
      return resolve();
    }

    if (argv.clear) {
      pathStorage.crear();
      return resolve();
    }

    const items = pathStorage.getAll();

    if (items.length) {
      console.group(chalk.yellow('PATHS:'))
      for (let p of items) {
        console.log(p);
      }
    } else {
      console.group(chalk.yellow('(NO PATHS STORED)'))  
    }
    
    
    console.log();

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
