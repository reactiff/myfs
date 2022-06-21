import expressApp from "express";
import chalk from "chalk";
import { exec } from "child_process";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import EventManager from "../EventManager.mjs";

import HyperViewEngine from "./view-engine/HyperViewEngine.mjs";
import StaticLoader from "./static/StaticLoader.mjs";
import HyperSocketServer from "./socket-server/HyperSocketServer.mjs";

export default class HyperServer {
  
  app;          // parent object

  express;
  static;
   
  httpServer;
  socketServer;

  viewEngine; 

  constructor(app, options = {}) {

    EventManager.implementFor(this, [ 
      'onReady',
    ], options.events, options.eventHandlers, options );

    this.app = app;

    // Express app
    this.express = expressApp();

    // static server manages files and hot-reloads
    this.static = new StaticLoader(this);

    // for hyper engine, create request handler
    this.viewEngine = new HyperViewEngine(this)

    this.initRoutes(app.schema);

    this.httpServer = this.createHttpServer(app.schema);

    // last thing
    this.socketServer = new HyperSocketServer(this);

    process.title = app.schema.name || "HyperApp";
  }

  initRoutes(schema) {
    // assign route handlers
    for (let key of Object.keys(schema.routes)) {
      const r = schema.routes[key];
      const pathFromKey = key === "index" ? "/" : (key === '/' ? key : "/" + key);
      this.express[r.method || "get"].call(
        this.express,
        pathFromKey,
        (req, res) => {
          debugger; // new web request
          this.viewEngine.render(r, req, res);
        }
      );
    }
    // CATCH-ALL ROUTE
    this.express.get("*", (req, res) => {
      res.status(404).send("Page not found");
    });
  }

  createHttpServer(schema) {
    //////////////////////////////////////////////////////////////////////////  <-- LISTEN, AND GET HTTP SERVER
    return this.express.listen(schema.port, () => {
      console.log("HTTP server started.");

      // Resolve for localhost
      if (!schema.public) {
        console.log("Schema is not public and is only available on localhost.");
        this.notify("onReady", { url: `http://localhost:${schema.port}` });
        return;
      }

      // Resolve for remote host
      if (schema.public) {
        this.createPublicProxy(schema);
      }
    });
  } // end createHttpServer

  createPublicProxy(schema) {
    console.log("The schema is public.  Creating a public proxy using NGROK.");
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
        if (stdout) {
          console.log(stdout);
        }
        if (err || stderr) {
          throw new Error(err || stderr);
        }
      });
      this.notify("onReady", { url: host });
    } catch (err) {
      inspectErrorStack(err);
    }
  }
}
