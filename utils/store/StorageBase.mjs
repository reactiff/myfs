
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
        store.show(this.uniqueKey);
    }

    
}
