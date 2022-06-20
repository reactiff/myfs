import SocketManager from "./SocketManager.mjs";
import EventManager from "./EventManager.mjs";

function sendSocketMessage(model, prefix, data) {
  model.socket.send(prefix + ":" + JSON.stringify(data));
}

export default class APIControllerBase {
  
  _parent;

  _config;
  _state;

  _hooks = [];
  _actions = {};
  _scripts = {};
  _templates = {};
  _styles = {};

  // implemented in derived classes
  socket = undefined;

  constructor({ parent, events, eventHandlers }) {
    this._parent = parent;
    EventManager.implementFor(this, events, eventHandlers);

    // TODO implement state manager
    // this._state = new StateManager(this, {});

    // socket 
    this._socket = new SocketManager(this, { 
      onOpen: this.onSocketOpen,
      // onClose: this.onSocketClose,
      onClientConnect: this.onSocketClientConnect,
      onClientDisconnect: this.onSocketClientDisconnect,
    });

  }

  // VIRTUAL METHODS
  getName() { throw new Error("getName() not implemented by the controller") }
  getWsUrl() { throw new Error("getWsUrl() not implemented by " + this.getName()) }

  _sendAction(action, payload) {
    sendSocketMessage(this, "action", { action, ...payload });
  }

  _sendState(payload) {
    sendSocketMessage(this, "state", payload);
  }

  _sendConfig(payload) {
    sendSocketMessage(this, "config", payload);
  }

  /////////
  // STATE
  
  /** Overwrites existing state with new one. */
  setState(state) {
    this._state.setState(state);
    this._sendState(state);
    this.notify("onStateChange", () => this.getState());
  }

  /** Merges the partial state into existing state. */
  updateState(partial) {
    this.setState(Object.assign({}, this.state, partial));
  }

  /** Gets app.state overriden with page state */
  getState() {
    return this.parent ? Object.assign({}, this.parent.getState(), this.state) : this.state;
  }

  /////////
  // CONFIG

  setConfig(config) {
    this.config = config;
    this._sendConfig(this, config);
    this.notify("onConfigChange", this);
  }

  /** Gets app.config overriden with page.config */
  getConfig() {
    return Object.assign({}, this.app.getConfig(), this.config);
  }

  ////////
  // HOOKS
  addHook(pathInState, handler) {
    this.hooks.push({ path: pathInState, handler });
  }

  //////////
  // ACTIONS
  addAction(name, fnOrPayload) {
    this.actions[name] = fnOrPayload;
  }

  ////////////
  // TEMPLATES
  addTemplate(name, template) { 
    const t = { name, template };
    this.templates[name] = t;
    this._sendAction('addTemplate', t); 
  }

  sendHotTemplateUpdate(name, delta) {
    this._sendAction('updateTemplate', { name, delta });
  }

  /////////
  // STYLES
  
  addStyle(name, style) { 
    const s = { name, style };
    this.styles[name] = s;
    this._sendAction('addStyle', s); 
  }

  sendHotStyleUpdate(name, delta) {
    this._sendAction('updateStyle', { name, delta });
  }

}
