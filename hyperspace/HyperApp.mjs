import expressApp from "express";
import path from "path";
import chalk from "chalk";
import { createViewEngine } from "./viewEngine/createViewEngine.mjs";
import { exec } from "child_process";
import { makeStaticFileLoaders } from "./viewEngine/makeStaticFileLoaders.mjs";
import inspectErrorStack from "../utils/inspectErrorStack.mjs";
import fnOrValue from "../utils/fnOrValue.mjs";

// Split instance methods to be bound
import createAppSocket from "./createAppSocket.mjs";
import requestPage from './requestPage.mjs';
import { randomUUID } from "crypto";

const on = {};

function onTemplateHotUpdate(pages, name, deltas) {
  for (let d of deltas) {
    for (let request of pages) {
      request.page.sendHotTemplateUpdate(name, d);
    }
  }
}

function onStyleHotUpdate(pages, name, deltas) {
  for (let d of deltas) {
    for (let request of pages) {
      request.page.sendHotStyleUpdate(name, d);
    }
  }
}

function deprecateProperty(property, object, objectAlias, suggestionTest) {
  if (Reflect.has(object, property)) {
    console.warn(`${objectAlias + "." || "Property "}${property} is deprecated. ${suggestionTest}`)
  }
}

function getInitialState(schema) {
  const suggestion = 'It works now, but in the future use schema.state instead.';
  deprecateProperty('hyperState', schema, 'HyperAppSchema', suggestion);
  deprecateProperty('appState', schema, 'HyperAppSchema', suggestion);
  deprecateProperty('initialState', schema, 'HyperAppSchema', suggestion);
  const state = schema.state || schema.hyperState || schema.initialState || schema.appState;
  return {
    ...fnOrValue(state),
    title: schema.title,
  };
}

function preflightCheck(schema) {
  if (!schema.src) throw new Error('Schema is missing src folder.');
}

const _constructorId = randomUUID();
const _constructorError = 'Use HyperApp.create(schema) instead of new HyperApp()';
export default class HyperApp {
  constructor() {
    if (!arguments.length||arguments[0]!==Symbol.for(_constructorId)) throw new Error(_constructorError); 
    this.requestPage = requestPage.bind(this);
  }

  static create(schema) {
    return new Promise(resolve => {
      preflightCheck(schema);

      const hyperApp = new HyperApp(Symbol.for(_constructorId));
      hyperApp.schema = schema;

      // create app state
      hyperApp.state = getInitialState(schema); 

      hyperApp.clients = [];
      hyperApp.updateState = (partial) => {
        console.log(chalk.yellow('hyperApp.updateState(partial) is called'))
      }


      // Express app
      const express = hyperApp.express = expressApp();

      // VIEWS
      hyperApp.hotPages = [];
      
      hyperApp.staticLoaders = makeStaticFileLoaders(schema, {

        onTemplateHotUpdate: (name, deltas) =>
          onTemplateHotUpdate(hyperApp.hotPages, name, deltas),

        onStyleHotUpdate: (name, deltas) =>
          onStyleHotUpdate(hyperApp.hotPages, name, deltas),

      });
            
      const schemaEngine = createViewEngine(hyperApp, schema);

      // ROUTES
      const schemaRouteHandler = (route, req, res) => {
        schemaEngine.render(route, req, res);
      };
      const staticRouteHandler = (route, req, res) => {
        res.render(req.path + "index", { request: req });
      };
      const routeHandler = schemaEngine ? schemaRouteHandler
        : staticRouteHandler;

      const routes = schema.routes || { index: { method: "get" } };
      for (let key of Object.keys(routes)) {
        const route = routes[key];
        const pathFromKey = key === "index" ? "/" : "/" + key;
        const method = route.method || "get";
        const serverMethod = express[method];
        serverMethod.call(express, pathFromKey, (req, res) => {
          routeHandler(route, req, res);
        });
      }

      // IT SHOULD LOAD FROM WORKING DIRECTORY NOT THE PROGRAM DIRECTORY

      // EXPOSE PUBLIC FOLDER WITH STATIC CONTENT
      const c1 = process.cwd();
      const c2 = schema.publicFolder||'/public';
      
      const parentFolder = c1.slice(0, c1.length - 3);
      const pathToPublic = path.resolve(path.join(parentFolder, c2));

      console.log('-', chalk.rgb(250,128,30)(`Public folder set to ${pathToPublic}`));
      express.use(expressApp.static(pathToPublic));

      // CATCH-ALL ROUTE
      express.get("*", (req, res) => {
        console.log("NOT FOUND", req.method, chalk.red(req.originalUrl));
        res.status(404).send("Nothing here");
      });

      hyperApp.updateState = (partial) => {
        hyperApp.notify("appstart", hyperApp); 
      };

      //////////////////////////////////////////////////////////////////////////  <-- LISTEN, AND GET HTTP SERVER
      hyperApp.server = express.listen(schema.port, () => {
        
        console.group(chalk.green(`HyperApp started at:`, 
          chalk.white(`http://localhost:${schema.port}`)));
        
        // Resolve for localhost
        if (!schema.public) { 
          hyperApp.notify("appstart", hyperApp); 
          resolve(hyperApp);
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
      
      process.title = "HyperApp";
    });
  } // end of constructor

  
  onAppStart(listener) {
    on["appstart"] = listener;
  }
  onPageOpen(listener) {
    on["pageopen"] = listener;
  }
  onConnect(listener) {
    on["connect"] = listener;
  }
  onMessage(listener) {
    on["message"] = listener;
  }
  onDisconnect(listener) {
    on["disconnect"] = listener;
  }
  onPageClose(listener) {
    on["pageclose"] = listener;
  }
  onAppShutdown(listener) {
    on["appshutdown"] = listener;
  }

  notify(event, ...args) {
    if (Reflect.has(on, event)) {
      on[event](...args);
    }
  }
} // HyperApp
