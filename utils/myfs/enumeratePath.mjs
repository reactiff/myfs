import store from '../store/index.mjs';
import path from 'path';
import fs from 'fs';
import fsItem from './fsItem.mjs';
import minimatch from 'minimatch';

const excludeGlobPatterns = [];
for (let p of (store.get('exclude') || [])) {
    excludeGlobPatterns.push(p);
}

export function enumeratePath(p, options, search) {
    
    let dirItems = fs.readdirSync(p);

    if (!search.omittedItems) search.omittedItems = [];
    if (!search.excludedItems) search.excludedItems = [];
    if (!search.mismatchedPatterns) search.mismatchedPatterns = [];

    let fsItems = dirItems.reduce((allItems, item) => {

        let fullPath = path.join(p, item);
        
        const stat = fs.lstatSync(fullPath);
        const isFile = stat.isFile();
        const isDir = !stat.isFile();

        if (isDir) {
            fullPath = path.join(fullPath, "/");
        }

        let posixPath = fullPath.replace(/\\/g, "/");

        if (!options.includeAll) {

            if (isFile && options.matchPattern) {
                let patternMatched;
                patternMatched = options.matchPattern(posixPath);
                if (!patternMatched) {
                    search.mismatchedPatterns.push(fullPath);
                    return allItems;
                }    
            }

            const excludedByGlob = excludeGlobPatterns.some(glob => minimatch(posixPath, glob));

            if (excludedByGlob) {
                search.excludedItems.push(posixPath);
                return allItems;
            }
        }

        // If it got here, the file is included
        const fsi = new fsItem({ 
            path: p, 
            name: item,
            moduleName: item.replace(/\.mjs$/, ''),
            fullPath,
            stat,
        })

        let items = [];

        // DIRECTORY
        if (isDir && options.recursive) {
            items = fsi.enumerate(options, search);
        }

        // FILE
        if (isFile) { 
            items.push(fsi);
        }

        return allItems.concat(items);
    }, []);

    return fsItems.filter(x => !!x);
}