import EXPRESS from "express";
import chalk from "chalk";
import { exec } from "child_process";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import EventManager from "../EventManager.mjs";
import HyperViewEngine from "./view-engine/HyperViewEngine.mjs";
import StaticLoader from "./static/StaticLoader.mjs";
import HyperSocketServer from "./socket-server/HyperSocketServer.mjs";
import HyperPage from "../controllers/page/HyperPage.mjs";
import HyperEndpoint from "../controllers/endpoint/HyperEndpoint.mjs";
import logTrack from "utils/logTrack.mjs";

export default class HyperServer {
  app;          // parent object
  port;
  host;
  express;
  static;
  httpServer;
  socketServer;
  viewEngine; 
  ready = false;

  constructor(app, handlers = {}) {
    EventManager.implementFor(this, [ 
      'onReady',
    ], handlers );
    this.app = app;
    // Express app
    this.express = EXPRESS();
    // static server manages files and hot-reloads
    this.static = new StaticLoader(this);
    this.express.use(EXPRESS.static('hyperspace/hyper-app/public'))
    // for hyper engine, create request handler
    this.viewEngine = new HyperViewEngine(this)
    this.initRoutes();
    this.httpServer = this.createHttpServer(app.schema);
    // last thing
    this.socketServer = new HyperSocketServer(this);
    process.title = app.schema.title;
  }

  initRoutes() {
    for (let kv of Object.entries(this.app._pages || {})) {
      this._createPageHandler(kv[0], kv[1]);
    }
    for (let kv of Object.entries(this.app._endpoints || {})) {
      this._createEndpointController(kv[0], kv[1]);
    }
    // CATCH-ALL ROUTE
    this.express.get("*", (req, res) => {
      res.status(404).send(this.app.getName() + " does not have a page at this route");
    });
  }

  _createPageHandler(route, controller) {
    this.express.get(route, (req, res) => {
        // process new page request
        this.viewEngine.handlePageRequest(req, res, controller);
      }
    );
  }
  
  _createEndpointController(route, controller) {
    this.express.get(route, (req, res) => {
        // process new API request
        this.viewEngine.handleEndpointRequest(req, res, controller);
      }
    );
  }

  createHttpServer(schema) {
    this.host = schema.host || schema.H || 'localhost';
    this.port = schema.port;
    //////////////////////////////////////////////////////////////////////////  <-- LISTEN, AND GET HTTP SERVER
    return this.express.listen(this.port, () => {
      logTrack('HyperServer', "HTTP server started");
      logTrack('HyperServer', `http://${this.host}:${this.port}`);
      // Resolve for localhost
      if (!schema.public) {
        this.notify("onReady", { url: `http://${this.host}:${this.port}` });
        return;
      }
      // Resolve for remote host
      if (schema.public) {
        this.createPublicProxy(schema);
      }
    });
  } // end createHttpServer


  createPublicProxy(schema) {
    logTrack('HyperServer', "The schema is public.  Creating a public proxy using NGROK.");
    logTrack('HyperServer', chalk.yellow(`creating secure external tunnel...`));
    const tokens = [
      "ngrok",
      "http",
      this.host ? "--host-header=" + this.host : null,
      this.host ? "--hostname=" + this.host : null,
      schema.port,
    ];
    const args = tokens.filter((t) => !!t).join(" ");
    // execute NGrok command
    try {
      exec(args, (err, stdout, stderr) => {
        if (stdout) {
          logTrack('HyperServer', stdout);
        }
        if (err || stderr) {
          throw new Error(err || stderr);
        }
      });
      this.notify("onReady", { url: this.host });
    } catch (err) {
      inspectErrorStack(err);
    }
  }

  stop(callback) {
    const wsConns = Object.values(this.socketServer.connections);
    for (let ws of wsConns) {
      if (ws) {
        ws.close();
      }
    }
    setTimeout(() => {
      logTrack('HyperServer', 'stopping HTTP server');
      // stop the server from accepting new connections
      this.httpServer.close(() => {
        logTrack('HyperServer', "HTTP server closed");
        callback();
      });
    }, 0);
    
    
  }
}
