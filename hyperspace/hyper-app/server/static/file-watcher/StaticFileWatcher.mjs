import path from "path";
import fs from "fs";
import { Diff } from "diff";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import { assert } from "console";
import { printToConsole } from "utils/printToConsole.mjs";

 // these get hot-updated
export default class StaticFileManager {

  fullPath;
  filename;
  ext;
  src;

  notifyChange;
  options;
  
  rawContent;
  prevContent;

  constructor(fullPath, schema, options = { onChange: undefined }) {
       
    this.fullPath = fullPath;
    this.ext = path.extname(fullPath).slice(1);
    this.fileTitle = path.basename(fullPath, `.${this.ext}`);
    
    const filename = this.fileTitle + `.${this.ext}`;

    this.src = path.resolve(fullPath.slice(0, this.fullPath.length - filename.length));
    
    this.notifyChange = options.onChange;
    this.options = options;
    
    this.rawContent = fs.readFileSync(this.fullPath, "utf8");
    
    if (this.notifyChange) {
      const _this = this;
      fs.watchFile(_this.fullPath, { persistent: true, interval: schema.hotPollInt || 1000 }, () => {

          // FILE CHANGED
          printToConsole(fullPath + ' has changed and was sent to the browser');
          
          debugger

          _this.defaultReload()
            .catch(inspectErrorStack)
            .then(newContent => {
          
              debugger

              _this.prevContent = _this.rawContent;
              _this.rawContent = newContent;

              _this.defaultDiff(_this.prevContent, newContent)
                .catch(inspectErrorStack)
                .then(deltas => {

                  debugger

                  if (deltas.length > 0) {
                    _this.notifyChange(fullPath, deltas);
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

      debugger

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


