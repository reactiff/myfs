import WebSocket from "faye-websocket";

function processPageReadyEvent(e, app, scope) {
  if (e.data.startsWith("system:")) {
    const event = e.data.slice(7);
    if (event === "page-ready") {
      if (scope.pageResolved) { return true; }
      scope.pageResolved = true;
      app.hotPages.push({ requestId: scope.requestId, page: scope.page }); //    <-- Page registers for hot updates
      scope.resolve(scope.page); //                                   <-- Page becomes ready and resolves
      return true;
    }
  }
  return false;
}

// Page WebSocket

function createPageSocket(app, scope) {
  const { schema } = app;
  const { route } = scope;

  const ws = new WebSocket.Client(
    `ws://localhost:${schema.port + route}?role=controller`
  );

  // Events
  ws.onmessage = (e) => {
    if (typeof e.data === "string" && e.data.startsWith("action:")) {
      return scope.onAction(JSON.parse(e.data.slice(7)));
    }
    if (processPageReadyEvent(e, app, scope)) { return; }
    if (e.data.startsWith("error:")) { scope.onError(e.data.slice(6)); }
  };
  ws.onopen = () => {};
  ws.onclose = () => {
    const index = app.hotPages.findIndex((x) => x.requestId === scope.requestId);
    if (index >= 0) {
      app.hotPages.spilce(index, 1);
    }
  };

  return ws;
}

export default createPageSocket;