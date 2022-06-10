import store from '../store/index.mjs';
import path from 'path';
import fs from 'fs';
import fsItem from './fsItem.mjs';
import minimatch from 'minimatch';
import { GlobListStorage } from "../store/GlobListStorage.mjs";
import { StorageKeys } from '../store/StorageKeys.mjs';
import chalk from 'chalk';

const ignoredGlobStorage = new GlobListStorage(StorageKeys.IgnoredGlobs);
const ignoredGlobs = ignoredGlobStorage.getAll();

export function enumeratePath(p, myfs) {
    const cwd = path.resolve(process.cwd());
    const { options, search } = myfs;
    const dirItems = fs.readdirSync(p);
    const relativePath = p.slice(cwd.length).replace(/\\/g, "/");

    let fsItems = dirItems.reduce((allItems, item) => {
        let fullPath = path.join(p, item);
        const pathToTest = fullPath.replace(/\\/g, "/");

        // is it ignored?
        if (ignoredGlobs.some(glob => minimatch(pathToTest, glob))) {
            // the path should be ignored
            search.ignoredItems.push(pathToTest);
            return allItems;
        }

        const stat = fs.lstatSync(fullPath);

        
        // is there a file glob to match?
        if (!stat.isDirectory() && options.glob && !options.matchGlob(pathToTest)) {
            // path does not match the glob
            search.mismatchedPatterns.push(fullPath);
            return allItems;
        }

        if (stat.isDirectory() && options.recursive) {
            // DIRECTORY
            // fullPath = path.join(fullPath, "/");
            const items = enumeratePath(fullPath, myfs);
            return allItems.concat(items);
        } else {

            // is there max age?
            if (options.age) {
                const currentTime = new Date();
                const fileTime = new Date(stat.mtime);
                const ageMs = currentTime.getTime() - fileTime.getTime();
                if (ageMs > options.maxAgeMs) {
                    search.filteredPatterns.push(fullPath);
                    return allItems;
                }
            }
            
            // FILE
            allItems.push(
                new fsItem({ 
                    myfs,
                    path: p, 
                    name: item,
                    moduleName: item.replace(/\.mjs$/, ''),
                    fullPath,
                    relativePath,
                    stat,
                })
            );
            return allItems;
        }
    }, []);

    // filter out nullish items and return

    return fsItems.filter(x => !!x);
}