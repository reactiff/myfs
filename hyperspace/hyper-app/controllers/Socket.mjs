import chalk from "chalk";
import WebSocket from "faye-websocket";
import logTrack from "utils/logTrack.mjs";
import { CHECKMARK, CROSS } from "utils/special-chars/typographic.mjs";
import EventManager from "../EventManager.mjs";

// This class wraps WebSocket implementation for 
// App and Page controllers

export default class Socket {
  status;
  _initialized;
  _socket;
  _controller;
  _controllerEvents;
  
  constructor(controller, handlers = {}) {
    EventManager.implementFor(
      this,
      ['*', 'onReady', 'onAction', 'onError'],
      handlers
    );
    this._controller = controller;
    this._connect();
  }
  
  _connect() {
    const url = this._controller.getWsUrl();
    logTrack('Socket', chalk.italic.gray((this._controller.getName())) + ' connect --> ' + chalk.italic('(' + url + ')'));
    this.status = 'connecting' ;
    this._socket = new WebSocket.Client(url);
    this._socket.onmessage = (e) => this._messageReceived(e);
    this._socket.onopen = () => this._onOpen();
    this._socket.onclose = () => this._onClose();
  }

  _onOpen() {
    logTrack('Socket', chalk.italic.gray((this._controller.getName()) + ' ' + CHECKMARK + ' connected'));
    if (this._initialized) return;
    this._initialized = true;
    this.status = 'connected';
    this.notify("onReady", this)
  }
  
  _onClose() {
    logTrack('Socket', chalk.italic.gray((this._controller.getName())) + ' disconnected');
    this.status = 'reconnecting';
    this._connect();
  }

  _messageReceived(e) {
    if (typeof e.data !== "string") return;
    // logTrack('Socket', chalk.italic.gray((this._controller.getName())) + '_messageReceived', e.data);
    if (e.data.startsWith("action:")) return this._actionReceived(e);
    if (e.data.startsWith("event:")) return this._eventReceived(e);
    if (e.data.startsWith("error:")) return this._errorReceived(e);
  }

  _actionReceived(e) {
    logTrack('Socket', chalk.italic.gray((this._controller.getName())) + ' received an action', e.data);
    this.notify("onAction", { data: JSON.parse(e.data.slice(7)) });
  }
  
  _eventReceived(e) {
    const payload = e.data.slice(6);
    const pipePos = payload.indexOf('|');
    const eventNameLength = pipePos > -1 ? pipePos : payload.length;
    const eventName = payload.slice(0, eventNameLength);
    const eventData = payload.slice(eventNameLength);
    this.notify(eventName, { data: eventData });
  }

  _errorReceived(e) {
    this.notify("onError", e.data.slice(6));
  }
  
  get topics() {
    return this._controllerEvents;
  }

  // public methods
  send(message) {
    this._socket.send(message);
  }

  close() {
    logTrack(this._controller.getName(),  'got closed');
    this._socket.close();
  }
}
