import _ from "lodash";
import store from "./index.mjs";
import path from 'path';
import chalk from 'chalk'
import fs from 'fs';
import boxen from "boxen";

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class ListStorage {

    uniqueKey;
    itemName;

    constructor(uniqueKey, itemName = 'item', unique = false) {
        this.uniqueKey = uniqueKey;
        this.itemName = itemName || 'item';
        this.unique = unique;
    }

    add(value) {

        debugger

        
        // const array = store.get(this.uniqueKey) || [];
       
        // if (this.unique && array.includes(value)) {
        //     console.log(chalk.red(_.capitalize(this.itemName) + ' already exists:'), value);
        //     return;
        // }
    
        // array.push(value);
        // store.set(this.uniqueKey, array);
    
        store.add(this.uniqueKey, value);
        console.log(chalk.yellow(_.capitalize(this.itemName) + ' added:'), value);
        return;
    }

    delete(value) {

        debugger

        // const array = store.get(this.uniqueKey) || [];
        // if (!array.includes(value)) {
        //     console.error(chalk.red(_.capitalize(this.itemName) + ' does not exist:'), value);
        //     return;
        // }
    
        // const index = array.findIndex(x => x === value);
        // array.splice(index, 1);
        // store.set(this.uniqueKey, array);
    
        store.remove(this.uniqueKey, value);
        console.log(chalk.yellow(_.capitalize(this.itemName) + ' deleted:'), value);
        return;
    }

    clear() {
        store.set(this.uniqueKey, []);
        console.log(chalk.yellow('All ' + _.capitalize(this.itemName) + 's cleared'));
        return;
    }

    getAll() {


        const items = store.get(this.uniqueKey) || [];
        const decoded = items.map(item => decodeURIComponent(item));
        return decoded;
    }

    show(title) {

        console.log();
        console.log(boxen(' ' + title + ' '));
        console.log();

        store.show(this.uniqueKey);
    }
}


/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class PathListStorage extends ListStorage {
    constructor(uniqueKey) {
        super(uniqueKey, 'path', true);
    }
    
    add(value) {

        // done

        const pathToAdd = path.resolve(value);
    
        if (!fs.existsSync(pathToAdd)) {
            console.error(chalk.red('Invalid path: '), pathToAdd);
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
        
        super(uniqueKey, 'glob', true);
    }
}