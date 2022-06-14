import HyperViewEngine from "./HyperViewEngine";
import ExpressViewEngine from "./ExpressViewEngine";
import StaticServer from "./static-server/StaticServer.mjs";

export default class HyperServer {

  on = {};
  app;          // parent object
  express;
  static;
  viewEngine;   // request handler

  constructor(app, options) {
    this.app = app;

    if (options.onStart) this.on.onStart = options.onStart;
    
    // Express app
    this.express = createExpressApp();

    // static server manages files and hot-reloads
    this.static = new StaticServer(this);
    
    // for hyper engine, create request handler
    this.viewEngine = app.schema.engine === "hyper"
        ? new HyperViewEngine(this)
        : new ExpressViewEngine(this);
    
    setupExpress(this);
  }
  
  initRoutes() {
    const { schema } = this.app;
    // assign route handlers
    for (let key of Object.keys(schema.routes)) {
        const r = schema.routes[key];
        const pathFromKey = key === "index" ? "/" : "/" + key;
        this.express[r.method || "get"].call(
            this.express, 
            pathFromKey, 
            (req, res) => {
                debugger  // new web request
                routeHandler(r, req, res);
            }
        );
    }
    // CATCH-ALL ROUTE
    express.get("*", (req, res) => {
        res.status(404).send("Page not found");
    });
  }

  
  notify(event, ...args) {
    if (Reflect.has(on, event)) {
      const listeners = on[event];
      listeners.forEach(callback => {
        callback(...args);
      })
    }
  }
  
}


function setupExpress(hyperServer) {

    const { schema } = hyperServer.app;
      
      //////////////////////////////////////////////////////////////////////////  <-- LISTEN, AND GET HTTP SERVER
      hyperServer.httpServer = express.listen(schema.port, () => {
            
        // Resolve for localhost
        if (!schema.public) { 
            hyperServer.notify('onStart', { url: `http://localhost:${schema.port}` });
            return;
        }

        // Resolve for remote host
        if (schema.public) {
          console.log(chalk.yellow(`creating secure external tunnel...`));
          const host = schema.host || schema.H;
          const tokens = [
            "ngrok",
            "http",
            host ? "--host-header=" + host : null,
            host ? "--hostname=" + host : null,
            schema.port,
          ];
          
          const args = tokens.filter((t) => !!t).join(" ");

          // execute NGrok command
          try {
            exec(args, (err, stdout, stderr) => {
              if (stdout) { console.log(stdout); }
              if (err || stderr) { throw new Error(err || stderr); }
            });  
            hyperApp.notify("appstart", hyperApp);
            resolve(hyperApp);
          }
          catch(err) {
            inspectErrorStack(err);
          }


        }
      });

      //////////////////////////////////////////////////////////////////////////  <-- LISTEN, AND GET HTTP SERVER
      createAppSocket(hyperApp);
      
      process.title = schema.name || "HyperApp";
    
  } // end of constructor
