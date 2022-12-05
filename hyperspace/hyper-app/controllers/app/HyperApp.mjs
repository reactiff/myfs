import { validateSchema, applySchemaDefaults } from "../../schema/json-schema.2.mjs";
import ControllerBase from "../ControllerBase.mjs";
import HyperPage from "../page/HyperPage.mjs";
import HyperEndpoint from "../endpoint/HyperEndpoint.mjs";
import HyperServer from "../../server/HyperServer.mjs";
import Socket from "../Socket.mjs";
import logTrack from "utils/logTrack.mjs";

// Hyper App Controller

function copyMembers(target, source) {
  const keys = Object.keys(source);
  for (let k of keys) {
    target[k] = source[k];
  }
}

export default class HyperApp extends ControllerBase {

  schema = {};
  ready = false;
  server;         
  _url;
  _pages = {};
  _endpoints = {};

  constructor(schema = {}) {
    
    super({
      parent: undefined, // App has no parent.  Page has app as parent.
      eventNames: ['onReady', 'onSocketReady', 'onServerReady'],
      events: schema.events,
      state: { 
        title: schema.title,
        ...schema.state 
      },
    });
    
    this.schema = validateSchema(applySchemaDefaults(schema));
    
    this.__createPageControllers();
    this.__createEndpointControllers();

    // socket 
    this._socket = new Socket(this, { 
      onReady: (e) => {
        this.notify('onSocketReady'); 
        this.__tryInit();
      },
    });

    // server
    this.server = new HyperServer(this, {
      onReady: (e) => {
        this._url = e.data.url;
        this.notify('onServerReady');
        this.__tryInit();
      },
    });
  }

  __createPageControllers() {
    for (let kv of Object.entries(this.schema.pages || {})) {
      const [route, config] = kv;
      const controller = new HyperPage({ app: this, route });
      copyMembers(controller, config);
      this._pages[route] = controller;
    }
  }
  __createEndpointControllers() {
    for (let kv of Object.entries(this.schema.endpoints || {})) {
      const [route, config] = kv;
      const controller = new HyperEndpoint({ app: this, route });
      copyMembers(controller, config);
      this._endpoints[route] = controller;
    }
  }
  
  __tryInit() {
    const cntOnReady = this.getNotifyCount('onReady');
    const cntOnSocketReady = this.getNotifyCount('onSocketReady');
    const cntOnServerReady = this.getNotifyCount('onServerReady');
    if (cntOnReady > 0) return;
    if (cntOnSocketReady === 0) return;
    if (cntOnServerReady === 0) return;
    // this.init(); 
    this.notify('onReady'); 
  }
  
  // OVERRIDES
  getName() { return 'HyperApp'}
  getWsUrl() { return `ws://localhost:${this.schema.port}?role=app-controller` }
  

  get url() {
    return 'http://' + this.server.host + ':' + this.server.port;
  }

  
  close(callback) {
    debugger

    this._socket.close();
    for (let p of Object.values(this._pages)) {
      p.close();
    }

    // delete this._pages;
    // delete this._endpoints;

    setTimeout(() => {
      debugger
      this.server.stop(() => {
        callback();
      });
    }, 100)
    
  }

} 

