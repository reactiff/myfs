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

export default class HyperServerSocket {

  controller;
  pages = {};
  pageKeys = [];
  
  // history of messages sent (to resend on reloads and for new clients)
  messageHistory = [];

  constructor(hyperServer) {
    this.hyperServer = hyperServer;
    this.init(hyperServer.httpServer);
  }

  init(httpServer) {
  
    ///////////////////////////////////////////////////
    // THIS IS HYPER APP WEB SOCKET SERVER
  
    httpServer.on("upgrade", function (req, socket, body) {
      if (WebSocket.isWebSocket(req)) {
        var ws = new WebSocket(req, socket, body);
  
        ws.on("open", function (event) {

          // NEW CONNECTION
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
  
          // CONTROLLER IS A PROCESS THAT PROVIDES DATA TO THE PAGE MODEL
          if (role === "controller") {
            this.controller = conn;
          } else {
            
            // PROCESS NEW CLIENT
            const id = req.headers["sec-websocket-key"];
            event.target.clientId = id;
            this.pages[id] = conn;
            this.pageKeys = Object.keys(this.pages);
  
            if (this.messageHistory.length) {
              this.messageHistory.forEach((m) => event.target.send(m));
            }
  
            this.controller.target.send("system:page-ready");
            console.log("client connected:", id);
          }
        });
  
        ws.on("message", function (event) {
  
          debugger

          // const requestId = event.target.requestId;
          const role = event.target.role;
          if (role === "controller") {
            this.pageKeys.forEach((key) => this.pages[key].target.send(event.data));
            this.messageHistory.push(event.data);
          } else {
            this.controller.target.send(event.data);
          }
  
        });
  
        ws.on("close", function (event) {

          debugger

          const role = event.target.role;
          if (role === "controller") {
            console.log("controller disconnected");
          } else {
            const id = event.target.clientId;
            delete this.pages[id];
            this.pageKeys = Object.keys(this.pages);
            console.log("client disconnected:", id);
          }
        });
      }
    });
  }
}

