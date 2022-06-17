import open from "open";
import path from "path";
import fnOrValue from "utils/fnOrValue.mjs";
import { getProgramDirectory } from "../../bin/getProgramDirectory.mjs";
import { validateSchema } from "./json-schema.mjs";
import Page from "./page/Page.mjs";
import EventManager from "./EventManager.mjs";
import HyperServer from "./hyper-server/HyperServer.mjs";
import HyperAppController from "./HyperAppController.mjs";

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

const extendDefaultSchema = (schemaOptions) => {
  return Object.assign(
    {}, schemaOptions
  );
};

export default class HyperApp {

  schema = {};

  controller;
  hyperServer;         
  url;

  clients = [];
  hotPages = [];

  constructor(schema, eventHandlers) {
    EventManager.implementFor(this, [ 
      'onStateChange',
      'onStart',
      'onShutdown',
      'onConnect',
      'onDisconnect',
      'onReady'
    ], eventHandlers);
    this.schema = validateSchema(extendDefaultSchema(schema));
    this.state = getInitialState(schema); 
    
    // controller
    this.controller = new HyperAppController(this);

    // server
    this.hyperServer = new HyperServer(this, {
      onStart: (serverInfo) => {
        this.url = serverInfo.url;
        this.notify('onStart');
      }
    });
  }

  // static factory method
  static create(schema, eventsHandlers) {
    return new Promise((resolve, reject) => {
      const app = new HyperApp(schema, {
        onStart: () => {
          resolve(app);
        }
      });
    })
  }
  
  /**
   * Creates a request for the resource at route and returns an instance of Page object.
   * @param {*} route 
   * @returns 
   */
  open(route) {

    return new Promise((resolve, reject) => {

      const page = new Page({
        app: this,
        route,
        onReady: () => {
          open(this.url + route).then(resolve, reject);
          resolve(page);
        }
      });
    })
  }
 
  ////////////////////////////////////////////////////////////////////////// API METHODS

  // STATE
  
  /** Overwrites existing state with new one. */
  setState(state) {
    this.state = state;
    this.sendState(this, state);
    this.notify("onStateChange", state); 
  }
  /** Merges the partial state into existing state. */
  updateState = (partial) => {
    this.setState(Object.assign({}, this.state, partial));
    this.notify("onStateChange", this); 
    // TODO: propagate to all clients
  }
  getState() { return this.state; }  


} 

