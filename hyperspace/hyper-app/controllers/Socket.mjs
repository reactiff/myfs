import WebSocket from "faye-websocket";
import EventManager from "../EventManager.mjs";

export default class Socket {

  _controller;

  _url;
  _socket;

  _initialized;
  status;

  constructor(controller, options = {}) {
    EventManager.implementFor(
      this,
      ["*", "onReady"],
      options.events,
      options.eventHandlers,
      options
    );
    
    const _this = this;

    this._controller = controller;
    
    this._url = controller.getWsURL();
    this.status = 'connecting';

    this._socket = new WebSocket.Client(this._url);

    this._socket.onmessage = (e) => _this._messageReceived(e);
    
    this._socket.onopen = () => {
      if (_this._initialized) return;
      _this._initialized = true;
      _this.notify("onReady", _this)
    };
    
    this._socket.onclose = () => {
      // reconnect
      console.log('reconnecting to ' + _this._url);
      _this._socket = new WebSocket.Client(_this._url);
      _this.notify("onClose", _this)
    };
  }
  
  _messageReceived(e) {
    if (typeof e.data !== "string") return;
    if (e.data.startsWith("action:")) return this._actionReceived(e);
    if (e.data.startsWith("event:")) return this._eventReceived(e);
    if (e.data.startsWith("error:")) return this._errorReceived(e);
  }

  _actionReceived(e) {
    this.notify("onAction", { data: JSON.parse(e.data.slice(7)) });
  }
  
  _eventReceived(e) {
    const payload = e.data.slice(7);
    const pipePos = payload.indexOf('|');
    const eventNameLength = pipePos > -1 ? pipePos : payload.length;
    const eventName = payload.slice(0, eventNameLength);
    const eventData = payload.slice(eventNameLength);
    this.notify(eventName, { data: JSON.parse(eventData) });
  }

  _errorReceived(e) {
    this.notify("onError", e.data.slice(6));
  }
  
  // public methods
  send(message) {
    this._socket.send(message);
  }

}
