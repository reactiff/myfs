import ControllerBase from '../ControllerBase.mjs';

// Hyper Endpoint Controller

export default class HyperEndpoint extends ControllerBase {

  app;
  route;
  _options;
  ready = false;

  constructor(options = { app: undefined, route: '/' } ) {

    super({ 
      parent: options.app,
      eventNames: [ 'onReady', 'onClientConnect', 'onClientDisconnect' ], 
      events: { ...options.events }
    });
    
    this.app = options.app;
    this.route = options.route;
    this._options = options;
    
  }
  
  // OVERRIDES
  getName() { return `Endpoint('${this.route}')`}
  
  __tryNotifyReady() {
    const cntOnReady = this.getNotifyCount('onReady');
    if (cntOnReady > 0) return;
    this.ready = true;
    this.notify('onReady'); 
  }
}



