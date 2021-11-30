import minimatch from 'minimatch';
import fs from 'fs';

export function resolvePath(relativeOrAbsolutePath) {
    const isRelative = /^[\.\/]/.test(relativeOrAbsolutePath);
    return isRelative ? 
        path.join(path.resolve(process.cwd()), relativeOrAbsolutePath)
        : path.resolve(relativeOrAbsolutePath);
}

export function readFile(glob) {
    const files = fs.readdirSync(glob);

    const fullPath = myfs.resolvePath(file);
    return fs.readFileSync(path.resolve(fullPath), 'utf8');
}


/**
 * @deprecated It's always been wack to be honest.
*/
export function open(abspath, options = {}) {
    console.warn("Calling deprecated function!");
    const paths = options.global 
        ? store.get('paths') || []
        : [abspath || path.resolve(process.cwd())];
    const search = {};
    const fsItems = paths.reduce((allItems, p) => {
        const items = enumeratePath(p, options, search);
        return allItems.concat(items)
    }, []);
    const mfs = new myfs(fsItems, search, {});
    return mfs;
}
