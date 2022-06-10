import store from './store/index.mjs';
import path from 'path';
import { enumeratePath } from './myfs/enumeratePath.mjs';
import { 
    resolvePath,
    readFile,
    // open,
} from './myfs/getFilesByGlob.mjs';
import SearchSession from './search/SearchSession.mjs';
import chalk from 'chalk';

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
        this.path = path.resolve(process.cwd());

        this.search = new SearchSession(this);

        this.items = enumeratePath(this.path, this);

        // If searching, then for every file, prepare the search
        if (this.options.find) {
            this.search.execute();
            return;
        }
        
        if (this.options.sortFiles) {
            this.items.sort(this.options.sortFiles)
        }
                
        this.notify('results-ready', { 
            items: this.items,
            progress: 1,
        });
    }

    

}

export default myfs;
