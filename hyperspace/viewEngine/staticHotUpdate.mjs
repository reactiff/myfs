import path from "path";
import fs from "fs";

import { Diff } from "diff";

import inspectErrorStack from "utils/inspectErrorStack.mjs";
import chalk from "chalk";
import { processStateHooks } from "./processStateHooks.mjs";

class StaticHotUpdate {

  constructor(filename, schema) {
    
    const _this = this;

    const ext = path.extname(filename).slice(1);
    const name = path.basename(filename, `.${ext}`);

    Object.assign(this, { pathTo: schema.src, filename, name });
    
    this.fullPath = path.resolve(path.join(this.pathTo, filename));

    const rawHTML = fs.readFileSync(this.fullPath, "utf8");
    const stateHookedHTML = processStateHooks(rawHTML)
    this.content = stateHookedHTML;

    this.middleware = {
      reload: this.defaultReload,
      diff: this.defaultDiff,
    };

    if (schema.hotUpdate) {

      fs.watchFile(
        this.fullPath,
        {
          persistent: true,
          interval: schema.hotPollInt || 1000,
        },
        () => {
        
          // FILE CHANGED
          console.log( chalk.rgb(128,240,180)(filename + ' has changed and was sent to the browser'));
          
          _this.middleware.reload(_this.fullPath)
            .catch(inspectErrorStack)
            .then(newContent => {

          
              _this.middleware.diff(_this.content, newContent)
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
      resolve([]);
      const differences = Diff.diffLines(prev, current, {
        ignoreCase: true,
        ignoreWhitespace: true,
        newlineIsToken: true,
      });
    });
  }

  /** If you want to pass your (BETTER) implementation of async reload that accepts (fullPath) to the changed file and returns new content */
  reload(ext, betterWayToReload) {
    this.middleware[ext].reload = betterWayToReload;
  }

  /** If you want to pass your (BETTER) implementation of async diff that accepts (prevContent, newContent) to the changed file and returns an array of differences */
  diff(ext, betterWayToDiff) {
    this.middleware[ext].diff = betterWayToDiff;
  }

  onUpdate(handler) {
    this.notifyChange = handler;
  }

  getContent() {
    return this.content;
  }
}

export default StaticHotUpdate;
