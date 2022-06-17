import WebSocket from "faye-websocket";
import EventManager from "../EventManager.mjs";

function processPageReadyEvent(page, controller, e) {
  const event = e.data.slice(7);
  if (event === "page-ready") {
    if (page.pageResolved) {
      return true;
    }
    page.pageResolved = true;
    page.app.hotPages.push({ requestId: page.requestId, page: page }); //   <-- Page registers for hot updates
    page.resolve(page); //                                                  <-- Page becomes ready and resolves
    controller.notify("onReady");
    return true;
  }
}

function parseIncomingMessage(page, controller, e) {
  page.notify("onMessageReceived", e.data);

  if (typeof e.data === "string" && e.data.startsWith("action:")) {
    return page.notify("onActionReceived", JSON.parse(e.data.slice(7)));
  }

  if (typeof e.data === "string" && e.data.startsWith("system:")) {
    return processPageReadyEvent(page, controller, e);
  }

  if (typeof e.data === "string" && e.data.startsWith("error:")) {
    return page.notify("onError", e.data.slice(6));
  }
}

// Page WebSocket
export default class HyperAppController {

  app;
  socket;

  constructor(page, options = {}) {
    EventManager.implementFor(
      this,
      ["onReady", "onClose"],
      options.events,
      options.eventHandlers,
      options
    );

    this.page = page;

    this.url = `ws://localhost:${this.page.app.schema.port + this.page.route}?role=app-controller`;

    this.socket = new WebSocket.Client(this.url);

    // Events
    this.socket.onmessage = (e) => parseIncomingMessage(page, this, e);

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
  }
}
