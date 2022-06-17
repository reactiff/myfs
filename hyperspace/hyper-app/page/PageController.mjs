import WebSocket from "faye-websocket";
import EventManager from "../EventManager.mjs";


// Page WebSocket
export default class PageController {

  page;
  socket;

  constructor(page, options = {}) {
    EventManager.implementFor(
      this,
      ["onReady", "onClose", "onClientConnect", "onClientDisconnect"],
      options.events,
      options.eventHandlers,
      options
    );

    this.page = page;
    
    this.url = `ws://localhost:${this.page.app.schema.port + this.page.route}?role=page-controller`;
    this.socket = new WebSocket.Client(this.url);
    this.socket.onopen = () => this.notify("onReady", this);
    this.socket.onclose = () => {
      const index = page.app.hotPages.findIndex((p) => {
        if (p.requestId === page.requestId) {
          debugger;
          const isSame = p === page;
          return true;
        }
      });
      if (index >= 0) page.app.hotPages.spilce(index, 1);
      page.notify("onClose", page);
    };

    this.socket.onmessage = (e) => this.processMessage(e);

  }
  
  processMessage(e) {

    if (typeof e.data === "string" && e.data.startsWith("action:")) {
      return this.page.notify("onActionReceived", JSON.parse(e.data.slice(7)));
    }

    if (typeof e.data === "string" && e.data.startsWith("event:")) {
      return this.processEvent(e);
    }

    if (typeof e.data === "string" && e.data.startsWith("error:")) {
      return this.page.notify("onError", e.data.slice(6));
    }
  }

  
  processEvent(e) {
    const payload = e.data.slice(7);
    if (payload === "client-connected") {
      this.notify('onClientConnect');
    }
  }

}
