import open from "open";
import fnOrValue from "utils/fnOrValue.mjs";
import { validateSchema } from "./json-schema.mjs";
import ControllerBase from "../ControllerBase.mjs";
import HyperPage from "../page/HyperPage.mjs";
import HyperServer from "../../server/HyperServer.mjs";
import Socket from "../Socket.mjs";

// Hyper App Controller

export default class HyperApp extends ControllerBase {

  schema = {};
  server;         
  url;

  constructor(schema, eventHandlers) {

    super({
      parent: undefined, // App has no parent.  Page has app as parent.
      events: [ 
        'onStateChange',
        'onConfigChange',
        'onReady',
        'onEnd',
      ],
      eventHandlers,
      state: schema.state,
    });
    
    this.schema = validateSchema(schema);
        
    
    // socket 
    this._socket = new Socket(this, { 
      onReady: this.onSocketReady,
      onClientConnect: this.onSocketClientConnect,
      onClientDisconnect: this.onSocketClientDisconnect,
    });

    // server
    this.server = new HyperServer(this, {
      onReady: (serverInfo) => {
        this.url = serverInfo.url;
        this.notify('onReady');
      }
    });
  }

  // OVERRIDES
  getName() { return 'AppController'}
  getWsUrl() { return `ws://localhost:${this.app.schema.port}?role=app-controller` }

  /**
   * Creates a request for the resource at route and returns an instance of Page object.
   * @param {*} route 
   * @returns 
   */
  open(route) {
    return new Promise((resolve, reject) => {
      const page = new HyperPage({
        app: this,
        route,
        onReady: () => {
          open(this.url + route).then(resolve, reject);
          resolve(page);
        }
      });
    })
  }
} 

