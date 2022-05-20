import store from './store.mjs';
import path from 'path';
import { enumeratePath } from './myfs/enumeratePath.mjs';
import { 
    resolvePath,
    readFile,
    open,
} from './myfs/getFilesByGlob.mjs';
import readdirGlob from 'readdir-glob';
import fsItem from './myfs/fsItem.mjs';


// TODO: Custom scoring and sorting 
// - add attribute(name, x => y(x)) method like this:  searchResults.attribute('efficiency', res => measureEfficiency(res) )
// - then create a sorterByValueAtPath getSorterByValueAtPath('efficiency')

class myfs {
    constructor(items, search, oldCopy) {
        
        // inject split methods
        Object.assign(this, { 
            resolvePath,
            readFile,
            open,
        });

        this.protocolHandlers = oldCopy ? oldCopy.protocolHandlers || {} : {};

        if (!items) return;

        const _this = this;
        this.items = items;

        if (!search) return;
                
        if (!search.results) search.results = [];
        if (!search.startedCount) search.startedCount = 0;
        if (!search.finishedCount) search.finishedCount = 0;
        if (!search.progress) search.progress = 0;    
        this.search = search;
                    
        const cnt = items.length;
        for (let i = 0; i < cnt; i++) {
            const fsi = items[i];
            if (fsi.search && fsi.search.startTime === undefined) {
                
                fsi.onSearchComplete = ({ ok, matches, error }) => {

                    search.finishedCount++;
                    search.progress = search.finishedCount / search.startedCount;

                    const result = {
                        number: search.finishedCount,
                        file: fsi,
                        ok, 
                        matches,
                        error,
                    };

                    search.results.push(result);

                    if (search.startedCount === search.finishedCount) {
                        _this.notify('search-update', { 
                            result,
                            progress: search.progress,
                            results: search.results,
                        });
                    }
                    
                }

                search.startedCount++;

                fsi.search.start()
            }
        }
    }

    notify(protocol, e) {
        const handlers = this.protocolHandlers[protocol];
        if (!handlers) return;
        for (let h of handlers) {
            h.call(null, {
                name: protocol,
                ...e,
            });
        }
    }

    subscribe(protocol, handler) {
        let handlers = this.protocolHandlers[protocol];
        if (!handlers) {
            this.protocolHandlers[protocol] = handlers = [];
        }
        const i = handlers.findIndex(h => h === handler);
        if (i >= 0) throw new Error('Already subscribed to ', protocol);
        handlers.push(handler);
    }

    unsubscribe(protocol, handler) {
        const handlers = this.protocolHandlers[protocol];
        if (!handlers) return;
        const i = handlers.findIndex(h => h === handler);
        if (i >= 0) handlers.splice(i, 1);
    }
    
    ///////////////////////////////////
    
    options(options) {
        this.options = options;
        return this;
    }

    path(path) {
        this.path = path;
        return this;
    }
    
    onResults(handler) {
        this.subscribe('search-update', handler);
        return this;
    }
    
    files(pattern) {
        this.filters = (this.filters || [])
            .concat(
                (item) => item.isFile() && (pattern ? pattern.test(item.name) : true)
            );
        return this;
    }

    directories() {
        this.filters = (this.filters || [])
            .concat(
                item => !item.isFile()
            );
        return this;
    }

    filter(condition) {
        this.filters = (this.filters || [])
            .concat( condition );
        return this;
    }

    sort(order) {
        this.sortOrder = order;
        return this;
        
    }

    execute() {
        const search = {};

        const paths = (this.options.global 
            ? store.get('paths') || [] 
            : [ this.path || path.resolve(process.cwd()) ]);
        
        
        let items = [];

        // scan all paths, expanding if recursive, 
        // and collect all matching items
        for (let p of paths) {
            const itemsFromPath = enumeratePath(p, this.options, search);
            items = items.concat( itemsFromPath );
        }
                    
        // Apply all filters, and reduce the number of items
        if (this.filters) {
            const _filters = this.filters;
            items = items.filter(item => _filters.every(test => test(item)));
        }
                 
        // If searching, then for every file, prepare the search
        if (this.options.search) {
            for (let f of items) {
                if (f.stat.isFile()) {
                    f.prepareSearch(this.options);
                }
            }
        }
        
        if (!this.options.search) {
            items = this.sortOrder ? items.sort(this.sortOrder) : items;
        }
        
        return new myfs(items, search, this);

        // return new myfs(fsItems, search, {});
    }

    toArray() {
        return Array.from(this.items);
    }


    map(...args) {
        // what does this do ???
        return new myfs(this.items.map(...args), this.search, this);
    }

    
    static match(glob) {
        return new Promise((resolve, reject) => {

            const dirPart = path.dirname(glob);
            const filePart = path.basename(glob);
                
            const globber = readdirGlob(dirPart, {pattern: filePart});

            const matches = [];
            
            globber.on('match', m => {
                matches.push(path.resolve(m.absolute));
            });
            globber.on('error', err => {
                console.error('fatal error', err);
            });
            globber.on('end', (m) => {
                resolve(new myfs(matches));
            });
        });
    }

    first() {
        return new fsItem(this.items[0]);
    }

}

export default myfs;
