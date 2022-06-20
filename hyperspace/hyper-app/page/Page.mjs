import {assert} from 'utils/assert.mjs';
import APIControllerBase from '../APIControllerBase.mjs';
import SocketManager from '../SocketManager.mjs';

// Page 

export default class Page extends APIControllerBase {

  // DEPRECATED
  // pageResolved = false;

  app;
  route;
  _options;

  // declared in APIControllerBase
  socket;

  remoteClients = [];

  constructor(options = { app: undefined, route: '' } ) {

    super({ 
      parent: options.app,
      events: [ 
        'onClientConnect',
        'onClientDisconnect',
        'onReady',
        'onStateChange',
        'onConfigChange',
      ], 
      eventHandlers: { ...options.events, ...options.eventHandlers, ...options }
    });

    this._options = options;

    this.app = options.app;
    this.route = options.route;
    
    // socket 
    this._socket = new SocketManager(this, { 
      onOpen: this.onSocketOpen,
      // onClose: this.onSocketClose,
      onClientConnect: this.onSocketClientConnect,
      onClientDisconnect: this.onSocketClientDisconnect,
    });
  }
  
  // OVERRIDES
  getName() { return 'PageController'}
  getWsUrl() { return `ws://localhost:${this.app.schema.port + this.page.route}?role=page-controller` }

  // SOCKET EVENT HANDLERS
  onSocketOpen(e) { this.init(); this.notify('onReady', this); }
  
  onSocketClientConnect(e) {
    this.notify('onClientConnect', this);
  }
    
  init() {

    const { templates, styles } = this.app.hyperServer.static;

    Object.values(styles).forEach(s => {
      this.sendHotStyleUpdate(s.name, s.getContent())
    });

    Object.values(templates).forEach(t => { 
      this.addTemplate(t.name, t.getContent())
    });

    // 1. set initial page state
    if (this._options.state) {
      this.setState(this._options.state);
    }
    
    // 2. then the views
    // this.render(this.app.schema.render),

    // ready!
    // this.updateState({ appReady: true });
    
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


}



