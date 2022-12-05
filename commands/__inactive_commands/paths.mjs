import store from "utils/store/index.mjs";
import _ from 'lodash';
import path from 'path';
import chalk from 'chalk'
import fs from 'fs';
import { parseOptions } from "utils/parseOptions.mjs";
import { PathListStorage } from "utils/store/list.mjs";
import { printToConsole } from "utils/printToConsole.mjs";

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
export const desc = `Manage working paths`;
export const group = 'Settings';

export async function execute(context) {
  try {

    const { argv } = context;

    debugger
    
    parseOptions(argv, options);

    const pathStorage = new PathListStorage();

    if (argv.add) {
      pathStorage.add(argv.add);
      return;
    }

    if (argv.delete) {
      pathStorage.delete(argv.delete);
      return;
    }

    if (argv.clear) {
      pathStorage.crear();
      return;
    }

    const items = pathStorage.getAll();

    if (items.length) {
      console.group(chalk.yellow('PATHS:'))
      for (let p of items) {
        printToConsole(p);
      }
    } else {
      console.group(chalk.yellow('(NO PATHS STORED)'))  
    }
    
    printToConsole();

  } catch (ex) {
    throw new Error(ex.message);
  }
}
