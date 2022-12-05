import logTrack from 'utils/logTrack.mjs';
import ControllerBase from '../ControllerBase.mjs';
import Socket from '../Socket.mjs';

// Hyper Page Controller

export default class HyperPage extends ControllerBase {

  app;
  route;
  _options;
  ready = false;

  // from config
  events;       // nullableDictionary("^on[A-Z][a-z0-9-]+$", t.function),
  scripts;      // t.nullableArray,
  styles;       // t.nullableArray,
  templates;    // nullableDictionary("^/[a-z0-9-]+$", t.html), // e.g.: "item": "<div class='item'></div>"
  actions;      // nullableDictionary("^/[a-z0-9-]+$", t.function), // e.g.: "do-something": fn()
  hooks;        // nullableDictionary("^[a-z0-9]*[a-z0-9\\.]*[a-z0-9]+$", t.function), // e.g.: "settings.profile.views": fn()

  constructor(options = { app: undefined, route: '/' } ) {

    super({ 
      parent: options.app,
      eventNames: ['onReady', 'onClientConnect', 'onClientDisconnect'],
      events: options.events, 
    });
    
    this.app = options.app;
    this.route = options.route;
    this._options = options;

    // socket 
    this._socket = new Socket(this, { 
      onReady: (e) => {
        this.__notifyReady();
      },
      onClientConnect: null,
      onClientDisconnect: null,
    });
  }
  
  // OVERRIDES
  getName() { return `HyperPage`}
  getWsUrl() { return `ws://localhost:${this.app.schema.port + this.route}?role=page-controller&id=${this.route}`}

  // __register() {
  //   this._sendAction("registerPageController", { route: this.route });
  // }

  __notifyReady() {
    const cntOnReady = this.getNotifyCount('onReady');
    if (cntOnReady > 0) return;
    logTrack(this.getName(), 'page ready: ' + this.route);
    this.notify('onReady'); 
  }

  /**
   * Called by WebSocketServer when a new remotem client connects.
   * It will send all static hyperpage resources like scripts, styles, 
   * handlers, state etc. HyperPage to the client via the websocket
   * @param {*} remote Remote connection passed from WebSocketServer
   */
  initializeClient(remote) { 

    debugger

    logTrack(this.getName(), 'initializeClient()');

    // little helper used in this method only 
    const __sendClientActions = (action, dictionary) => {
      for (let entry of Object.values(dictionary)) {
        remote.target.send("action:" + JSON.stringify(entry));
      }
    }
    
    __sendClientActions('addTemplate', this._templates);
    __sendClientActions('addStyle', this._styles);
    __sendClientActions('addScript', this._scripts);
    __sendClientActions('addHook', this._hooks);

    // TODO DO WE NEED TO SEND THIS?
    // const { templates, styles } = this.app.server.static;
    // Object.values(styles).forEach(s => {
    //   this.sendHotStyleUpdate(s.name, s.getContent())
    // });
    // Object.values(templates).forEach(t => { 
    //   this.addTemplate(t.name, t.getContent())
    // });

    // 4. finally, send initial page state
    const state = this.getState();

    try {
      remote.target.send('state' + ":" + JSON.stringify(state));
    }
    catch(ex) {
      logTrack(this.getName(), 'ERROR:', ex.message);
    }
  }

  // TODO process hooks and render

  // processHooks() {
    
  //   debugger

  //   assert(Array.isArray(views), "it must be an array");
  //   views.forEach(v => {
  //     const { data, target, template } = v;
  //     this.sendAction('render', data, target, template);
  //   });
  // }

  ////////////////////////////////////////////////////////////////////////// API METHODS

  get url() {
    return this.app.url + '/' + this.route;
  }


  request(params = {}) {
    
    const _this = this;

    return new Promise((resolve, reject) => {

      debugger

      const queryString = Object.entries(params)
        .map(kv => `${kv[0]}=${encodeURIComponent(kv[1])}`)
        .join('&');
      
      const url = _this.app._url + _this.route + '?' + queryString;

      const request = {
        params, 
        queryString,
        url,
      };

      open()
        .then(
          () => resolve(request), 
          () => reject()
        );
      });
    
  }
  
  close() {
    debugger
    this._socket.close();
  }
}



