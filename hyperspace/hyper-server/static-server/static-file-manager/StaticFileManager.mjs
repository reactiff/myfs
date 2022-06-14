import path from "path";
import fs from "fs";
import { Diff } from "diff";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import { _processStateHooks } from "./_processStateHooks.mjs";
import { assert } from "console";

function makeAssertions(filename, schema, options) {
  assert(options, 'Options is missing');
  assert(options.onChange || options.hotUpdate === false, 'Options is missing required onChange handler: (name, deltas) => void');
}

 // these get hot-updated
export default class StaticFileManager {

  constructor(filename, schema, options) {
    makeAssertions(filename, schema, options);
   
    const ext = path.extname(filename).slice(1);
    const name = path.basename(filename, `.${ext}`);
    Object.assign(this, { 
      pathTo: schema.src, 
      filename, 
      name 
    });
    
    this.notifyChange = options.onChange;
    this.options = options;
    this.fullPath = path.resolve(path.join(this.pathTo, filename));

    const rawHTML = fs.readFileSync(this.fullPath, "utf8");
    const stateHookedHTML = _processStateHooks(rawHTML)
    this.content = stateHookedHTML;

    if (options.hotUpdate) {
      const _this = this;
      fs.watchFile(_this.fullPath, {
          persistent: true,
          interval: schema.hotPollInt || 1000,
        }, () => {
          // FILE CHANGED
          console.log(filename + ' has changed and was sent to the browser');
          
          _this.defaultReload(_this.fullPath)
            .catch(inspectErrorStack)
            .then(newContent => {
          
              _this.defaultDiff(_this.content, newContent)
                .catch(inspectErrorStack)
                .then(deltas => {

                  if (deltas.length > 0) {
                    _this.notifyChange(_this.name, deltas);
                  }
                });
            });
        }
      );
    }
  }

  defaultReload(fullPath) {
    return new Promise(resolve => {
      const newContent = fs.readFileSync(fullPath, "utf8");
      resolve(newContent);
    });
  }

  defaultDiff(prev, current) {
    return new Promise(resolve => {
      if (prev !== current) {
        resolve([current]);
      }
      const differences = Diff.diffLines(prev, current, {
        ignoreCase: false,
        ignoreWhitespace: false,
        newlineIsToken: true,
      });
      resolve(differences);
    });
  }

  getContent() {
    return this.content;
  }
}


