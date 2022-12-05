import StateManager from "../StateManager.mjs";
import EventManager from "../EventManager.mjs";

function sendSocketMessage(model, prefix, data) {
  model._socket.send(prefix + ":" + JSON.stringify(data));
}

export default class ControllerBase {
 
  // #region MEMBER DECLARATIONS
  _parent;  // this references the App in derived Page;  for App it is not set
  _config;
  _state; // StateManager
  _hooks = [];
  _actions = {};
  _scripts = {};
  _templates = {};
  _styles = {};
  _socket = undefined; // implemented in derived classes
  //#endregion

  constructor({ parent, eventNames, events, state }) {
    this._parent = parent;
    EventManager.implementFor(this, eventNames, events);
    this._state = new StateManager(this, state);
  }
  
  init() {  throw new Error('init() not implemented in derived class') }

  //#region VIRTUAL METHODS
  getName() { throw new Error("getName() not implemented by the controller") }
  getWsUrl() { throw new Error("getWsUrl() not implemented by " + this.getName()) }
  _sendAction(action, payload) { sendSocketMessage(this, "action", { action, payload }); }
  _sendState(path, payload) { sendSocketMessage(this, "state", { path, payload }); }
  //#endregion

  /////////
  // STATE
  
  /** Overwrites existing state with new one. */
  setState(state) {
    this._state.setState(state);
    this._sendState('', state);
  }

  /** Merges the partial state into existing state. */
  updateState(path, partialState) {
    this._state.updateState(path, partialState);
    this._sendState(path, partialState);
  }

  /** Gets app.state overriden with page state */
  getState() {
    const thisState = this._state.getState();
    if (this._parent) {
      const parentState =  this._parent.getState();
      return Object.assign({}, parentState, thisState)
    } else {
      return thisState;
    } 
  }
  
  ////////
  // HOOKS
  addHook(pathInState, handler) {
    this._hooks.push({ path: pathInState, handler });
  }

  //////////
  // ACTIONS
  addAction(name, fnOrPayload) {
    this._actions[name] = fnOrPayload;
  }

  ////////////
  // TEMPLATES
  addTemplate(name, template) { 
    const t = { name, template };
    this._templates[name] = t;
    this._sendAction('addTemplate', t); 
  }
  sendHotTemplateUpdate(name, delta) {
    this._sendAction('updateTemplate', { name, delta });
  }

  /////////
  // STYLES
  
  addStyle(name, style) { 
    const s = { name, style };
    this._styles[name] = s;
    this._sendAction('addStyle', s); 
  }
  sendHotStyleUpdate(name, delta) {
    this._sendAction('updateStyle', { name, delta });
  }

  /////////
  // SCRIPTS
  
  addScript(name, script) { 
    const s = { name, script };
    this._scripts[name] = s;
    this._sendAction('addScript', s); 
  }
  sendHotScriptUpdate(name, delta) {
    this._sendAction('updateScript', { name, delta });
  }

}
