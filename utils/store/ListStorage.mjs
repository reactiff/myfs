import _ from "lodash";
import store from "./index.mjs";
import path from "path";
import chalk from "chalk";
import fs from "fs";
import boxen from "boxen";
import { StorageBase } from "./StorageBase.mjs";
import { ShowHelp } from "../help.mjs";

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class ListStorage extends StorageBase {
  unique;

  constructor(uniqueKey, itemName = "item", unique = false) {
    super(uniqueKey, itemName || "item");
    this.unique = unique;
  }

  add(value) {
    debugger;
    store.add(this.uniqueKey, value);
    console.log(chalk.yellow(_.capitalize(this.itemName) + " added:"), value);
    return;
  }

  delete(value) {
    debugger;
    store.remove(this.uniqueKey, value);
    console.log(chalk.yellow(_.capitalize(this.itemName) + " deleted:"), value);
    return;
  }

  clear() {
    store.set(this.uniqueKey, []);
    console.log(
      chalk.yellow("All " + _.capitalize(this.itemName) + "s cleared")
    );
    return;
  }

  getAll() {
    const items = store.get(this.uniqueKey) || [];
    const decoded = items.map((item) => decodeURIComponent(item));
    return decoded;
  }

  getNextCommand(ctx) {
    debugger;

    const depth = ctx.depth + 1;
    const name = ctx.args[depth];

    switch (name) {
        case "add":
            return getAddHandler(this, depth, ctx);
        case "delete":
            return getDeleteHandler(this, depth, ctx);
        case "clear":
            return getClearHandler(this, depth, ctx);
      default:
        return undefined;
    }
  }

  getAvailableCommands() {
      return {
          add: { command: 'add <item>', name: 'add', arguments: '<item>', help: `Add ${this.itemName} to the list`, options: {}, group: '', [Symbol.for('type')]: 'module', },
          delete: { command: 'delete <item>', name: 'delete', arguments: '<item>', help: `Delete ${this.itemName} from the list`, options: {}, group: '', [Symbol.for('type')]: 'module', },
          clear: { command: 'clear', name: 'clear', help: `Delete all ${this.itemName}s`, options: {}, group: '', [Symbol.for('type')]: 'module', },
      };
  }
}

async function getAddHandler(storage, depth, ctx) {
    debugger
    const tokens = ctx.argv._.slice(depth);
    if (tokens.length === 0) return ShowHelp;
    for (let t of tokens) {
        storage.add(t);
    }
}


async function getDeleteHandler(storage, depth, ctx) {
    debugger
    const tokens = ctx.argv._.slice(depth);
    if (tokens.length === 0) return ShowHelp;
    for (let t of tokens) {
        storage.delete(t);
    }
}


async function getClearHandler(storage, depth, ctx) {
    debugger
    storage.clear();
}


/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class PathListStorage extends ListStorage {
  constructor(uniqueKey) {
    super(uniqueKey, "path", true);
  }

  add(value) {
    // done

    const pathToAdd = path.resolve(value);

    if (!fs.existsSync(pathToAdd)) {
      console.error(chalk.red("Invalid path: "), pathToAdd);
      return;
    }

    super.add(pathToAdd, true);
  }

  delete(value) {
    super.delete(value);
  }

  clear() {
    super.clear();
  }
}

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class GlobListStorage extends ListStorage {
  constructor(uniqueKey) {
    super(uniqueKey, "glob", true);
  }
}
