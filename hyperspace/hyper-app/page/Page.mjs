import {assert} from 'utils/assert.mjs';
import { v4 as uuid } from 'uuid';
import EventManager from '../../EventManager.mjs';
import PageController from './controller/PageController.mjs';

// Page 

function sendSocketMessage(page, prefix, data) {
  const message = prefix + ':' + JSON.stringify(data);
  page.controller.socket.send(message);
  page.notify('onMessageSent', message);
}

function sendAction(page, data) { 
  sendSocketMessage(page, 'action', data);
  page.notify('onActionSent', data);
}

function sendState(page, data) { 
  sendSocketMessage(page, 'state', data);
  page.notify('onStateSent', data);
}

export default class Page {

  app;
  route;
  state;
  requestId;
  pageResolved = false;

  constructor(options = { app: undefined, route: '' } ) {
    this.app = options.app;
    this.route = options.route;
    EventManager.implementFor(this, [ 
      'onError',
      'onOpen',
      'onClose',
      
      'onMessageSent',
      'onActionSent',
      'onStateSent',

      'onMessageReceived',
      'onActionReceived',
      'onStateReceived',

      'onReady',
      'onStateChange',
      'onTemplateAdded',
      'onTemplateHotUpdate',
      'onStyleHotUpdate',
    ], options.events, options.eventHandlers, options);

    this.requestId = uuid();

    // controller
    this.controller = new PageController(this, { 
      onReady: () => {
        this.init();
        this.notify('onReady', this);
      } 
    });

    
  }
  
  addTemplate(name, template) { 
    sendAction(this, { action: "addTemplate", name, template }); 
    this.notify('onTemplateAdded', name, template);
  }

  sendHotTemplateUpdate(name, delta) {
    sendAction(this, { action: "updateTemplate", name, delta });
    this.notify('onTemplateHotUpdate', name, delta);
  }
  
  sendHotStyleUpdate(name, delta) {
    sendAction(this, { action: "addStyle", name, delta });
    this.notify('onStyleHotUpdate', name, delta);
  }

  init() {
    const { templates, styles } = this.app.hyperServer.static;
    Object.values(styles).forEach(s => {
      this.sendHotStyleUpdate(s.name, s.getContent())
    });
    Object.values(templates).forEach(t => { 
      this.addTemplate(t.name, t.getContent())
    });
    // 1. Send page state
    sendState(this, this.getState());
    // 2. then the views
    this.render(this.app.schema.render),
    // ready!
    this.updateState({ appReady: true });
    
  }

  render(views) {
    debugger
    assert(Array.isArray(views), "it must be an array");
    views.forEach(v => {
      const { data, target, template } = v;
      sendAction(this, { action: "render", data, target, template });
    });
  }
  
  ////////////////////////////////////////////////////////////////////////// API METHODS

  // STATE

  setState(state) {
    this.state = state;
    this.sendState(this, state);
    this.notify("onStateChange", this); 
  }

  updateState(partial) {
    this.setState(Object.assign({}, this.state, partial));
  }

  getState() {
    return Object.assign({}, this.app.getState(), this.state);
  }
  
}



