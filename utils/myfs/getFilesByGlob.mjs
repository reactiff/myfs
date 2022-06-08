import minimatch from 'minimatch';
import fs from 'fs';
import path from 'path';
import store from "utils/store/index.mjs";
import { enumeratePath } from './enumeratePath.mjs';

import MyFS from "utils/myfs.mjs";

export function resolvePath(relativeOrAbsolutePath) {
    const isRelative = /^[\\.\\/]/.test(relativeOrAbsolutePath);
    return isRelative ? 
        path.join(path.resolve(process.cwd()), relativeOrAbsolutePath)
        : path.resolve(relativeOrAbsolutePath);
}

export function readFile(glob) {
    
    debugger
    
    const files = fs.readdirSync(glob);
    const fullPath = resolvePath(glob);
    return fs.readFileSync(path.resolve(fullPath), 'utf8');
}


// /**
//  * @deprecated It's always been wack to be honest.
// */
// export function open(abspath, options = {}) {
    
//     debugger

//     console.warn("Calling deprecated function!");
//     const paths = options.global 
//         ? store.get('paths') || []
//         : [abspath || path.resolve(process.cwd())];
//     const search = {};
//     const fsItems = paths.reduce((allItems, p) => {
//         const items = enumeratePath(p, options, search);
//         return allItems.concat(items)
//     }, []);
//     const mfs = new MyFS(fsItems, search, {});
//     return mfs;
// }
