import _ from "lodash";
import store from "./index.mjs";
import chalk from "chalk";
import { StorageBase } from "./StorageBase.mjs";
import { ShowHelp } from "../help.mjs";

// LIST COMMANDS

// These subcommands represent command modules that are normally loaded using module imports
// The Symbol.type module tells the module loaded to return this object as is without trying to load it from a file as it normally does.

class ListStorageInterfaceImplementation {
  constructor(storage) {
    
    // ADD
    this.add = {
      [Symbol.for("type")]: "module",
      command: "add <items..>",
      name: "add",
      arguments: "<item>",
      hasArguments: true,
      help: `Add ${storage.itemName} to the list`,
      options: {},
      group: "",
      async execute(ctx) {
        const tokens = Array.isArray(ctx.argv.items) ? ctx.argv.items : [];
        if (tokens.length === 0) return ShowHelp;
        // ok
        for (let t of tokens) {
          storage.add(t);
        }
      },
    };

    // DELETE
    this.delete = {
      [Symbol.for("type")]: "module",
      command: "delete <items..>",
      name: "delete",
      arguments: "<item>",
      hasArguments: true,
      help: `Delete ${storage.itemName} from the list`,
      options: {},
      group: "",
      async execute(ctx) {
        debugger;
        const tokens = Array.isArray(ctx.argv.items) ? ctx.argv.items : [];
        if (tokens.length === 0) return ShowHelp;
        // ok
        for (let t of tokens) {
          storage.delete(t);
        }
      },
    };

    // CLEAR
    this.clear = {
      [Symbol.for("type")]: "module",
      command: "clear",
      name: "clear",
      help: `Clear all ${storage.itemName}s`,
      options: {},
      group: "",
      async execute(ctx) {
        debugger;
        storage.clear();
      },
    };
  }
}

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class ListStorage extends StorageBase {
  unique;

  constructor(uniqueKey, itemName = "item", unique = false) {
    super(uniqueKey, itemName || "item");
    this.unique = unique;
    this.listStorageCommands = new ListStorageInterfaceImplementation(this);
  }

  add(value) {
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

  getSubcommand(commandName) {
    if (!Reflect.has(this.listStorageCommands, commandName)) undefined;
    return this.listStorageCommands[commandName];
  }

  /** ListStorage.getAvailableCommands() */
  getAvailableCommands() {
    return this.listStorageCommands;
  }
}
