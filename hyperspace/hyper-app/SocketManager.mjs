import WebSocket from "faye-websocket";
import EventManager from "./EventManager.mjs";

export default class SocketManager {

  _controller;

  _url;
  _socket;

  constructor(controller, options = {}) {
    EventManager.implementFor(
      this,
      ["onOpen", "onClose", "onClientConnect", "onClientDisconnect", "onAction", "onError"],
      options.events,
      options.eventHandlers,
      options
    );
    
    this._controller = controller;
    
    this._url = controller.getWsURL();

    this._socket = new WebSocket.Client(this.url);
    this._socket.onopen = () => this.notify("onOpen", this);
    this._socket.onclose = () => this.notify("onClose", this);
    this._socket.onmessage = (e) => this.processMessage(e);

    // inject methods into model
    this.send = (wsMessage) => this.socket.send(wsMessage);
  }
  
  processMessage(e) {
    if (typeof e.data !== "string") return;
    if (e.data.startsWith("action:")) return this.processAction(e);
    if (e.data.startsWith("event:")) return this.processEvent(e);
    if (e.data.startsWith("error:")) return this.processError(e);
  }

  processAction(e) {
    this.notify("onAction", { data: JSON.parse(e.data.slice(7)) });
  }
  
  processEvent(e) {
    const payload = e.data.slice(7);
    const pipePos = payload.indexOf('|');
    const eventNameLength = pipePos > -1 ? pipePos : payload.length;
    const eventName = payload.slice(0, eventNameLength);
    const eventData = payload.slice(eventNameLength);
    this.notify(eventName, { data: JSON.parse(eventData) });
  }

  processError(e) {
    this.notify("onError", e.data.slice(6));
  }

}
