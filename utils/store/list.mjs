import { capitalize } from "lodash";
import store from "./index.mjs";
import path from 'path';
import chalk from 'chalk'
import fs from 'fs';

export class ListStorage {

    uniqueKey;
    itemName;

    constructor(uniqueKey, itemName, unique) {
        this.uniqueKey = uniqueKey;
        this.itemName = itemName || 'item';
        this.unique = unique;
    }

    add(value) {
        const array = store.get(this.uniqueKey) || [];
       
        if (this.unique && array.includes(value)) {
            console.log(chalk.red(capitalize(this.itemName) + ' already exists:'), value);
            return;
        }
    
        array.push(value);
        store.set(this.uniqueKey, array);
    
        console.log(chalk.yellow(capitalize(this.itemName) + ' added:'), value);
        return;
    }

    delete(value) {
        const array = store.get('paths') || [];
        if (!array.includes(value)) {
            console.error(chalk.red(capitalize(this.itemName) + ' does not exist:'), value);
            return;
        }
    
        const index = array.findIndex(x => x === value);
        array.splice(index, 1);
        store.set(this.uniqueKey, array);
    
        console.log(chalk.yellow(capitalize(this.itemName) + ' deleted:'), value);
        return;
    }

    clear() {
        store.set(this.uniqueKey, []);
    
        console.log(chalk.yellow('All ' + capitalize(this.itemName) + 's cleared'));
        return;
    }

    getAll() {
        store.get(this.uniqueKey) || []
    }
}


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


export class GlobListStorage extends ListStorage {
    constructor(uniqueKey) {
        super(uniqueKey, 'glob', true);
    }
}