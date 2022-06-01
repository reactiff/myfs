
import _ from "lodash";
import store from "./index.mjs";
import path from 'path';
import chalk from 'chalk'
import fs from 'fs';
import boxen from "boxen";

/** Do not pass strings to Storage constructors!  Use storageKeys dictionary. */
export class StorageBase {

    uniqueKey;
    itemName;

    constructor(uniqueKey, itemName) {
        this.uniqueKey = uniqueKey;
        this.itemName = itemName;
    }

    show(title) {
        console.log();
        console.log(boxen(' ' + title + ' '));
        console.log();
        store.show(this.uniqueKey);
    }

    
}
