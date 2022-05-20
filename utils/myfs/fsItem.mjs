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

    enumerate(options, context) {
        return enumeratePath(this.fullPath, options, context);
    }
    
    notify({ ok, matches }) {
        this.onSearchComplete({ ok, matches });
    }

    prepareSearch(options) {
        const _this = this;

        const search = _this.search = {
            options,
            startTime: undefined,
            endTime: undefined,
            elapsed: undefined,
            start() {
                if (search.startTime !== undefined) {
                    debugger
                    return;
                }
                search.startTime = Date.now();
                searchFile(_this.fullPath, search.options)
                .then(matches => {
                    search.terminate(true);
                    search.matches = matches,    
                    _this.notify({ ok: true, matches });
                })
                .catch(error => {
                    
                    if (errorCount) return;

                    errorCount++;

                    inspectErrorStack(error);

                    console.log( chalk.bgHex('#550000')(error.stack) );
                    search.terminate(false, error);
                    _this.notify({ ok: false, error });
                });
            },
            terminate(ok, error) {
                if (error) {
                    search.ok = false;
                    search.error = error.message || error;
                }
                else {
                    search.ok = ok;
                }
                search.endTime = Date.now();
                search.elapsed = search.endTime - search.startTime;
            },
        };
    }
}


function searchFile(fullPath, options) {
    return new Promise((resolve, reject) => {
        try {
            
            if (errorCount) return;

            const content = fs.readFileSync(path.resolve(fullPath), 'utf8');
            const matches = [...content.matchAll(options.search)];
            resolve(matches);
        } catch (err) {
            reject(err);
        }
    });
}
