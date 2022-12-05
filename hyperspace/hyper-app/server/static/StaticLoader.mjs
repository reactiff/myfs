import fs from "fs";
import path from "path";
import { getProgramDirectory } from "../../../../bin/getProgramDirectory.mjs";
import StaticFileManager from "./file-watcher/StaticFileWatcher.mjs";

function getDefaultSrc() {
  const rootDir = getProgramDirectory();
  return path.join(rootDir, 'hyperspace/hyper-app/server/static/src');
}

export default class StaticLoader {

  hyperServer; // parent object
  baseHtml;      // // this one does not get hot updated
  templates = {}; // these get hot-updated
  styles = {};    // these get hot-updated

  constructor(hyperServer) {
    this.hyperServer = hyperServer;
    this.init(hyperServer.app.schema.src || getDefaultSrc());

    if (!this.baseHtml) {
      throw new Error(
          "Could not find any views to load, are you sure you are in the right folder?  Ideally you want to be inside /src which should be adjacent to /public, they are siblings."
      );
    }

  }

  init(src) {
    const schema = this.hyperServer.app.schema;
    const dirItems = fs.readdirSync(src);
    for (let file of dirItems) {
      const ext = path.extname(file).slice(1);
      const name = path.basename(file, `.${ext}`);
      const fullPath = path.join(src, file);

      if (file === "base.html") {
        // do not hot-reload index.html
        this.baseHtml = new StaticFileManager(fullPath, schema, );
      } 

      else if (file.endsWith(".html")) {
        this.templates[name] = new StaticFileManager(fullPath, schema, {
          onChange: this.onTemplateHotUpdate
        });
      } 

      else if (file.endsWith(".css")) {
        this.styles[name] = new StaticFileManager(fullPath, schema, {
          onChange: this.onStyleHotUpdate
        });
      }
    }
  }

   
  // when HotReload occurs for HTML
  onTemplateHotUpdate(name, deltas) {
    const callbacks = this.hyperServer.app.hotPages.map((p) => p.page.sendHotTemplateUpdate);
    const argSeries = deltas.map((d) => [name, d]);
    this.asyncApplyAll(callbacks, argSeries);
  }

  // when HotReload occurs for CSS
  onStyleHotUpdate(name, deltas) {
    const callbacks = this.hyperServer.app.hotPages.map((p) => p.page.sendHotStyleUpdate);
    const argSeries = deltas.map((d) => [name, d]);
    this.asyncApplyAll(callbacks, argSeries);
  }
  
  /**
   * Asynchronously executes each function using .apply(arrArgs[n]) passing it each
   * args set n.
   * @param {*} functions Array of functions to call.
   * @param {*} argSeries Array of arrays, containing positional arguments to be applied.
   */
  async asyncApplyAll(functions, argSeries) {
    for (let fn of functions) {
      for (let args of argSeries) {
        fn.apply(null, args);
      }
    }
  }
}
