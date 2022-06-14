import WebSocket from "faye-websocket";

function parseUrlParams(url) {
  const pos = url.indexOf("?");
  if (pos < 0) {
    return {};
  }
  const tokens = url
    .slice(pos + 1)
    .split("&")
    .map((t) => t.split("="));
  const map = tokens.reduce((m, t) => Object.assign(m, { [t[0]]: t[1] }), {});
  return map;
}

function createAppSocket(app) {
  
  const { server } = app;

  let controller;
  let pages = {};
  let pageKeys = [];

  // history of messages sent (to resend on reloads and for new clients)
  let messageHistory = [];

  ///////////////////////////////////////////////////
  // THIS IS HYPER APP WEB SOCKET SERVER

  server.on("upgrade", function (req, socket, body) {
    if (WebSocket.isWebSocket(req)) {
      var ws = new WebSocket(req, socket, body);

      ws.on("open", function (event) {
        const params = parseUrlParams(event.target.url);
        // const requestId = params.requestId;
        const role = params.role;

        // event.target.requestId = requestId;
        event.target.role = role;

        const conn = {
          role,
          route: req.url.split("?")[0],
          url: req.url,
          protocol: ws.protocol,
          target: event.target,
          currentTarget: event.currentTarget,
        };

        if (role === "controller") {
          controller = conn;
        } else {
          
          // New ws connection from a page
          const id = req.headers["sec-websocket-key"];
          event.target.clientId = id;
          pages[id] = conn;
          pageKeys = Object.keys(pages);

          if (messageHistory.length) {
            messageHistory.forEach((m) => event.target.send(m));
          }

          controller.target.send("system:page-ready");
          console.log("client connected:", id);
        }
      });

      ws.on("message", function (event) {

        // const requestId = event.target.requestId;
        const role = event.target.role;
        if (role === "controller") {
          pageKeys.forEach((key) => pages[key].target.send(event.data));
          messageHistory.push(event.data);
        } else {
          controller.target.send(event.data);
        }

      });

      ws.on("close", function (event) {
        const role = event.target.role;
        if (role === "controller") {
          console.log("controller disconnected");
        } else {
          const id = event.target.clientId;
          delete pages[id];
          pageKeys = Object.keys(pages);
          console.log("client disconnected:", id);
        }
      });


      
    }
  });
}

export default createAppSocket;
