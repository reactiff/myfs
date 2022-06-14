import StaticFileManager from "./hot-reloader/StaticFileManager.mjs";

export default class StaticServer {

  hyperServer; // parent object
  indexHtml;      // // this one does not get hot updated
  templates = {}; // these get hot-updated
  styles = {};    // these get hot-updated

  constructor(hyperServer) {
    this.hyperServer = hyperServer;
    if (!hyperServer.app.schema.src) return;
    this.init(hyperServer.app.schema);
  }

  init(schema) {
    const dirItems = fs.readdirSync(schema.src);

    for (let file of dirItems) {
      const ext = path.extname(file).slice(1);
      const name = path.basename(file, `.${ext}`);

      if (file === "index.html") {
        // do not hot-reload index.html
        this.indexHtml = new StaticFileManager(file, schema, { hotUpdate: false });
      } 

      else if (file.endsWith(".html")) {
        this.templates[name] = new StaticFileManager(file, schema, {
          onChange: this.onTemplateHotUpdate
        });
      } 

      else if (file.endsWith(".css")) {
        this.styles[name] = new StaticFileManager(file, schema, {
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
