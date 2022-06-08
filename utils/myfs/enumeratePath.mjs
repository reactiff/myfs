import store from '../store/index.mjs';
import path from 'path';
import fs from 'fs';
import fsItem from './fsItem.mjs';
import minimatch from 'minimatch';
import { GlobListStorage } from "../store/GlobListStorage.mjs";
import { StorageKeys } from '../store/StorageKeys.mjs';

const ignoredGlobStorage = new GlobListStorage(StorageKeys.IgnoredGlobs);
const ignoredGlobs = ignoredGlobStorage.getAll();

export function enumeratePath(p, myfs) {
    
    const { options, search } = myfs;

    const dirItems = fs.readdirSync(p);
    
    let fsItems = dirItems.reduce((allItems, item) => {

        let fullPath = path.join(p, item);
        const pathToTest = fullPath.replace(/\\/g, "/");

        // is it ignored?
        if (ignoredGlobs.some(glob => minimatch(pathToTest, glob))) {
            // the path should be ignored
            search.ignoredItems.push(pathToTest);
            return allItems;
        }

        // is there a glob to match?
        if (options.matchGlob && !options.matchGlob(pathToTest)) {
            // path does not match the glob
            search.mismatchedPatterns.push(fullPath);
            return allItems;
        }

        const stat = fs.lstatSync(fullPath);
        
        if (stat.isDirectory() && options.recursive) {
            // DIRECTORY
            // fullPath = path.join(fullPath, "/");
            const items = enumeratePath(fullPath, myfs);
            return allItems.concat(items);
        } else {
            // FILE
            allItems.push(
                new fsItem({ 
                    myfs,
                    path: p, 
                    name: item,
                    moduleName: item.replace(/\.mjs$/, ''),
                    fullPath,
                    stat,
                })
            );
            return allItems;
        }
    }, []);

    // filter out nullish items and return

    return fsItems.filter(x => !!x);
}