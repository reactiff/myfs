import store from '../store.mjs';
import path from 'path';
import fs from 'fs';
import fsItem from './fsItem.mjs';
import minimatch from 'minimatch';

// const includeRegexPatterns = [];
// const includeGlobPatterns = [];
// for (let p of (store.get('include') || [])) {
//     const decoded = decodeURIComponent(p);
//     try {
//         const pattern = new RegExp(decoded, "")
//         includeRegexPatterns.push(pattern);
//     }
//     catch(ex) {
//         console.error(ex.message);
//     }
//     includeGlobPatterns.push(decoded);
// }

const excludeRegexPatterns = [];
const excludeGlobPatterns = [];
for (let p of (store.get('exclude') || [])) {
    const decoded = decodeURIComponent(p);
    try {
        const pattern = new RegExp(decoded, "");
        excludeRegexPatterns.push(pattern);
    }
    catch(ex) {
        console.error(ex.message);
    }
    excludeGlobPatterns.push(decoded);
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
                
                // if (posixPath.includes('.min.js')) debugger

                let patternMatched;
                patternMatched = options.matchPattern(posixPath);
                if (!patternMatched) {
                    search.mismatchedPatterns.push(fullPath);
                    return allItems;
                }    
            }

            
            // if (posixPath.includes('/Content/')) debugger

            // const excludedByRegex = excludeRegexPatterns.some(re => re.test(fullPath));
            const excludedByGlob = excludeGlobPatterns.some(glob => minimatch(posixPath, glob));

            if (excludedByGlob) {
                search.excludedItems.push(posixPath);
                return allItems;
            }

            // const includedByRegex = includePatterns.some(re => re.test(fullPath));
            // const includedByGlob = includeGlobPatterns.some(glob => minimatch(posixPath, glob));

            // if (! (includedByRegex || includedByGlob)) {
            //     search.omittedItems.push(fullPath)
            //     return allItems;
            // }
            
            
            
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

        // if (!options.includeAll && allItems.length > 0 && items.length > 0) debugger

        // for (let itm of items) {
        //     if (allItems.some(ei => ei.fullPath === itm.fullPath)) {
        //         debugger
        //     }
        // }


        return allItems.concat(items);
    }, []);

    // console.groupEnd();

    return fsItems.filter(x => !!x);
}