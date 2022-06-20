var hyperClient;

function createHyperClient() {
  let ws;

  // const createWsStateProxy = function (wsContext) {
  //   function receive(handler) {
  //     wsContext.updateHyperState = handler;
  //   }
  //   function send(data) {
  //     wsContext.ws.send("state:", JSON.stringify(data));
  //   }
  //   return new (function () {
  //     Object.assign(this, { receive, send });
  //     return this;
  //   })();
  // };

  // const createWsActionProxy = function (wsContext) {
  //   function receive(handler) {
  //     wsContext.updateHyperState = handler;
  //   }
  //   function send(data) {
  //     wsContext.ws.send("state:", JSON.stringify(data));
  //   }
  //   return new (function () {
  //     Object.assign(this, { receive, send });
  //     return this;
  //   })();
  // };

  const protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
  const address = protocol + window.location.host + window.location.pathname;

  ws = new WebSocket(address + `?role=page`);

  // ACTIONS
  function sendAction(data) { ws.send("action:", JSON.stringify(data)); }
  const actionIO = { ws, receive: null };
  const actions = createHyperActions(actionIO);
  
  // STATE
  function sendState(data) { ws.send("state:" + JSON.stringify(data)); }
  const stateIO = { ws, receive: null, send: sendState };
  const state = createHyperState(stateIO);

  // MESSAGE DISPATCHER
  ws.onmessage = (event) => {
    if (event.data.startsWith("state:")) {
      const payload = event.data.slice(6);
      const parsed = JSON.parse(payload);
      stateIO.receive(parsed.data);
    } else if (event.data.startsWith("action:")) {
      const payload = event.data.slice(7);
      actionIO.receive(JSON.parse(payload));
    }
  };

  return new (function () {
    Object.assign(this, {
      state,
      actions,
    });
    return this;
  })();
}

(() => {
  let cnt = 0;
  const init = () => {
    cnt++;
    if (!Reflect.has(window, "WebSocket")) {
      setTimeout(() => {
        init();
      }, 0);
      return;
    }

    document.title = cnt + ' tries';

    window.hyperClient = createHyperClient();
    window.state = window.hyperClient.state;
    window.actions = window.hyperClient.actions;

    app(hyperClient);
  };

  init();
})();
