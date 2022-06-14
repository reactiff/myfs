import createExpressApp from "express";
import path from "path";
import chalk from "chalk";
import open from "open";
import { createViewEngine } from "../viewEngine/createViewEngine.mjs";
import { exec } from "child_process";
import inspectErrorStack from "utils/inspectErrorStack";
import fnOrValue from "utils/fnOrValue";

// Split instance methods to be bound
import createAppSocket from "./createAppSocket.mjs";
import _requestPage from './_requestPage.mjs';
import { validateSchema } from "./json-schema.mjs";
import HyperServer from "../hyper-server/HyperServer.mjs";
import { getProgramDirectory } from "../../bin/getProgramDirectory.mjs";


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

function validateSchema(schema) {
  if (!schema.src) throw new Error('Schema is missing src folder.');
  return schema;
}

const DEFAULT_SCHEMA = {
  routes: { index: { method: "get" } },
  publicFolder: path.join(getProgramDirectory(), 'public'),
  engine: "hyper",
  port: 8585,
  public: false,
  deploy: false,
};

const extendDefaultSchema = (schemaOptions) => {
  return Object.assign(
    {}, DEFAULT_SCHEMA, schemaOptions
  );
};

const EVENTS = {
  onStateChange: undefined,
  onAppStart: undefined,
  onAppShutdown: undefined,
  onConnect: undefined,
  onDisconnect: undefined,
}

export default class HyperApp {
  
  // event handlers
  subscribers = {
    onStateChange: [],
    onAppStart: [],
    onAppShutdown: [],
    onConnect: [],
    onDisconnect: [],
  };      

  schema = {};
  server;         // will be 
  url;
  clients = [];
  hotPages = [];

  constructor(schema, options = { events: EVENTS }) {

    // bind event handlers supplied using options
    Object.keys(options.events)
      .filter(k => Reflect.has(this.subscribers, k))
      .forEach(k => this.subscribers[k].push(options.events[k]))


    this.schema = validateSchema(extendDefaultSchema(schema));


    this.state = getInitialState(schema); 

    // HyperServer bootstraps:
    // - express app
    // - static content
    // - hot-reloads
    // - route handlers
    this.hyperServer = new HyperServer(this, {
      onStart: (serverInfo) => {
        this.url = serverInfo.url;
        this.notify('appstart');
      }
    });
  }

  open(route) {

    return new Promise((resolve, reject) => {

      const page = new Page({
        app: this,
        resolve,
        pageResolved: false,
        requestId: uuid(),
        route,
        sendAction: (data) => { 
          const msg = "action:" + JSON.stringify(data);
          scope.ws.send(msg);
        },
        sendState: (data) => { 
          const msg = "state:" + JSON.stringify(data);
          scope.ws.send(msg) ;
        },
      });
  
      const ws = createPageSocket(app, scope)
  
      open(this.url + route).then(resolve, reject);
    })
    
  }

  /** 
   * Call .updateState(state) with partial state updates. 
   * State changes (deltas) will be relayed to all connected clients.
  */
  updateState = (partial) => {
    console.log(chalk.yellow('hyperApp.updateState(partial) is called'));
    // TODO: propagate to all clients
    hyperApp.notify("AppStart", hyperApp); 
  }

  onStateChange(listener) {
    this.subscribers["onStateChange"].push(listener);
    return this;
  }
  onAppStart(listener) {
    this.subscribers["onAppStart"].push(listener);
    return this;
  }
  onAppShutdown(listener) {
    this.subscribers["onAppShutdown"].push(listener);
    return this;
  }
  onConnect(listener) {
    this.subscribers["onConnect"].push(listener);
    return this;
  }
  onDisconnect(listener) {
    this.subscribers["onDisconnect"].push(listener);
    return this;
  }
  // onPageOpen(listener) {
  //   this.subscribers["onPageOpen"].push(listener);
  //   return this;
  // }
  // onPageClose(listener) {
  //   this.subscribers["onPageClose"].push(listener);
  //   return this;
  // }
  // onMessage(listener) {
  //   this.subscribers["onMessage"].push(listener);
  //   return this;
  // }
    
  notify(event, ...args) {
    if (Reflect.has(this.subscribers, event)) {
      const listeners = subscribers[event];
      listeners.forEach(callback => {
        callback(...args);
      })
    }
  }
} // HyperApp
