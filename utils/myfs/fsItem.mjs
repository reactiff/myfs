import path from 'path';
import fs from 'fs';
import { enumeratePath } from './enumeratePath.mjs';
import chalk from 'chalk';
import inspectErrorStack from '../inspectErrorStack.mjs';

var errorCount = 0;

function readToEnd(path, encoding = 'utf8') {
    return fs.readFileSync(path, encoding);
}

export default class fsItem {
    constructor(item) {
        const T = typeof item;
        
        if (T === 'string') {
            const dirPart = path.dirname(item);
            const filePart = path.basename(item);
            item = { 
                name: filePart,
                moduleName: filePart.replace(/\.mjs$/, ''),
                path: dirPart,
                fullPath: item,
            }
        }
        Object.assign(this, item);
        try {
            const stat = item.stat || fs.lstatSync(this.fullPath);
            this.stat = stat;
        }
        catch(e) {
            this.stat = { isFile: () => false }
        }
        
        this.onSearchComplete = undefined; // must be set by myFs
    }

    toString() {
        return readToEnd(this.fullPath);
    }

    json() {
        try {
            const file = readToEnd(this.fullPath);
            const json = JSON.parse(file);
            return json;
        }
        catch(err) {
            inspectErrorStack(err)
        }
        
    }

    isFile() { 
        return this.stat.isFile();
    }

    enumerate() {
        return enumeratePath(this.fullPath, this.myfs);
    }
    
    notify({ ok, matches }) {
        this.onSearchComplete({ ok, matches });
    }

    createSearch(onSearchComplete) {
        this.onSearchComplete = onSearchComplete;
        this.search = createSearch(this);
    }

    executeSearch() {
        this.search.start();
        this.myfs.search.startedCount++;
    }
}

function createSearch(fsi) {
    return {
        startTime: undefined,
        endTime: undefined,
        elapsed: undefined,

        start() {
            const { search } = fsi;
            if (search.startTime !== undefined) return;
            search.startTime = Date.now();
            searchFile(fsi)
                .then(matches => {
                    search.terminate(true);
                    search.matches = matches,    
                    fsi.onSearchComplete(fsi);
                })
                .catch(error => {
                    if (errorCount) return;
                    errorCount++;
                    inspectErrorStack(error);
                    console.log( chalk.bgHex('#550000')(error.stack) );
                    search.terminate(false, error);
                    fsi.onSearchComplete(fsi);
                });
        },

        terminate(ok, error) {
            const { search } = fsi;
            if (error) {
                search.ok = false;
                search.error = error.message || error;
            } else {
                search.ok = ok;
            }
            search.endTime = Date.now();
            search.elapsed = search.endTime - search.startTime;
        },
    };
}

function searchFile(fsi) {
    return new Promise((resolve, reject) => {
        try {
            if (errorCount) return;
            const content = fs.readFileSync(path.resolve(fsi.fullPath), 'utf8');
            const pattern = fsi.myfs.options.find;
            const matches = [...content.matchAll(pattern)];
            resolve(matches);
        } catch (err) {
            reject(err);
        }
    });
}
