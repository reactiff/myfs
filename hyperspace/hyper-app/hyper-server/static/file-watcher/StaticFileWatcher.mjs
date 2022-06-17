import path from "path";
import fs from "fs";
import { Diff } from "diff";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import { assert } from "console";

function makeAssertions(filename, schema, options) {
  assert(options, 'Options is missing');
  assert(options.onChange || options.hotUpdate === false, 'Options is missing required onChange handler: (name, deltas) => void');
}

 // these get hot-updated
export default class StaticFileManager {

  notifyChange;
  options;
  fullPath;
  rawContent;

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
    this.rawContent = fs.readFileSync(this.fullPath, "utf8");
    
    if (options.hotUpdate) {
      const _this = this;
      fs.watchFile(_this.fullPath, {
          persistent: true,
          interval: schema.hotPollInt || 1000,
        }, () => {
          // FILE CHANGED
          console.log(filename + ' has changed and was sent to the browser');
          
          _this.defaultReload()
            .catch(inspectErrorStack)
            .then(newContent => {
          
              _this.prevContent = _this.rawContent;
              _this.rawContent = newContent;

              _this.defaultDiff(_this.prevContent, newContent)
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

  defaultReload() {
    return new Promise(resolve => {
      resolve(fs.readFileSync(this.fullPath, "utf8"));
    });
  }

  defaultDiff(prev, curr) {
    return new Promise(resolve => {
      // if (prev !== curr) {
      //   resolve([curr]);
      // }
      const differences = Diff.diffLines(prev, curr, {
        ignoreCase: false,
        ignoreWhitespace: false,
        newlineIsToken: true,
      });
      resolve(differences);
    });
  }

  getContent() {
    return this.rawContent;
  }
}


