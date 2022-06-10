import path from 'path';
import fs from 'fs';
import { enumeratePath } from './enumeratePath.mjs';
import chalk from 'chalk';
import inspectErrorStack from '../inspectErrorStack.mjs';
import FileSearch from '../search/FileSearch.mjs';

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

    executeSearch() {
        this.search = new FileSearch(this);
        this.search.start();
    }
}
