import store from './store/index.mjs';
import path from 'path';
import { enumeratePath } from './myfs/enumeratePath.mjs';
import { 
    resolvePath,
    readFile,
    open,
} from './myfs/getFilesByGlob.mjs';
import readdirGlob from 'readdir-glob';
import fsItem from './myfs/fsItem.mjs';
import Search from './Search.mjs';

// TODO: Custom scoring and sorting 
// - add attribute(name, x => y(x)) method like this:  searchResults.attribute('efficiency', res => measureEfficiency(res) )
// - then create a sorterByValueAtPath getSorterByValueAtPath('efficiency')

class myfs {

    items;
    protocolHandlers = {};

    constructor(options /*items, search, oldCopy*/) {
        
        this.options = options;

        // inject split methods
        Object.assign(this, { 
            resolvePath,
            readFile,
            open,
        });

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
        
    toArray() {
        return Array.from(this.items);
    }

    static execute(options) {
        return new Promise((resolve, reject) => {
            const instance = new myfs(options);
            try {
                instance.execute(resolve);
            }
            catch(ex) {
                reject(ex);
            }
        })
    }

    execute(callback) {

        this.subscribe('results-ready', callback);

        this.search = new Search();
        this.path = path.resolve(process.cwd());
        this.items = enumeratePath(this.path, this);
                 
        // If searching, then for every file, prepare the search
        if (this.options.find) {
            return executeSearch(this);
        }
        
        if (this.options.sortOrder) {
            items.sort(this.options.sortOrder)
        }
                
        this.notify('results-ready', { 
            items,
            progress: 1,
        });
    }

    

}

export default myfs;

function executeSearch(_myfs) {
    const files = _myfs.items.filter(f => f.stat.isFile());
    files.forEach(f => f.createSearch(onSearchComplete))
    files.forEach(f => f.executeSearch())
}

function onSearchComplete(fsi) {

    const { myfs } = fsi;
    const { ok, matches, error } = fsi.search;

    myfs.search.finishedCount++;
    myfs.search.progress = myfs.search.finishedCount / 
                           myfs.search.startedCount;

    const result = {
        number: myfs.search.finishedCount,
        file: fsi,
        ok, 
        matches,
        error,
    };

    myfs.search.results.push(result);

    if (myfs.search.startedCount === myfs.search.finishedCount) {
        myfs.notify('results-ready', { 
            items: myfs.search.results,
            progress: myfs.search.progress
        });
    }
    
}
