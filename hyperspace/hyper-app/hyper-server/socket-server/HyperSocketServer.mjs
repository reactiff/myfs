import chalk from "chalk";
import WebSocket from "faye-websocket";
import { parseUrlParams } from "./parseUrlParams";

export default class HyperSocketServer {
  httpServer;
  connections = {};
  appController;
  pageControllers = {};
  pageControllerKeys = [];
  remoteClients = {};
  remoteClientKeys = [];
  messageHistoryEnabled = false;

  constructor(hyperServer) {
    this.hyperServer = hyperServer;
    this.httpServer = hyperServer.httpServer;
    this.init(hyperServer.httpServer);
  }

  init(httpServer) {
    const _this = this;
    httpServer.on("upgrade", (req, socket, body) => {
      if (WebSocket.isWebSocket(req)) {
        _this.createConnection(req, socket, body);
      }
    })
  }

  /** Private. DO NOT USE */
  createConnection(req, socket, body) {
    const ws = new WebSocket(req, socket, body);
    const wsID = req.headers["sec-websocket-key"];
    const args = { req, socket, body, wsID, ws };
    ws.on("open", event => this.connectionOpened(args, event));
    ws.on("message", event => this.processMessage(args, event));
    ws.on("close", event => this.connectionClosed(args, event));
    this.connections[wsID] = { ws }; 
  }

  connectionOpened(args, event) {
    debugger
    const { req, socket, body, wsID, ws } = args;
    const params = parseUrlParams(event.target.url);
    const remote = {
      params,
      name: params.name,
      role: params.role,
      route: req.url.split("?")[0],
      url: req.url,
      protocol: ws.protocol,
      target: event.target,
      currentTarget: event.currentTarget,
    };
    Object.assign(this.connections[wsID], remote);
    // REMOTE IS A "WS SERVER" FOR APP OR PAGE CONTROLLER
    if (params.role === "app-controller") {
      this.appController = remote;
    } 
    else if (params.role === "page-controller") {
      if (this.messageHistoryEnabled) remote.messageHistory = [];
      this.pageControllers[params.name] = remote;
      this.pageControllerKeys = Object.keys(this.pageControllers);
    } 
    else {
      event.target.clientId = wsID;
      this.remoteClients[wsID] = remote;
      this.remoteClientKeys = Object.keys(this.remoteClients);
      if (remote.messageHistory && remote.messageHistory.length) {
        remote.messageHistory.forEach(m => remote.target.send(m));
      }
      const pageName = remote.route;
      const pageController = this.pageControllers[pageName];
      if (!pageController) {
        console.log(chalk.bgRed.white('page name ' + pageName + ' does not exist'));
        return;
      }
      pageController.target.send("event:client-connected");
    }
  }
  
  connectionClosed(args, event) {
    const { req, socket, body, wsID, ws } = args;
    const remote = this.connections[wsID];
    if (remote.role === 'app-controller') {
      console.log(chalk.yellow(remote.role + " disconnected"));
    } else if (remote.role === 'page-controller') {
      console.log(chalk.yellow(remote.role + ` [${event.target.name}] disconnected`));
    } else {
      delete this.remoteClients[wsID];
      console.log(chalk.yellow(`remote client [${wsID}] disconnected`), wsID);
    }
    delete this.connections[wsID]; 
  }

  ///////////////////////////////////////////// MESSAGES 

  processMessage(args, event) {
    debugger
    const remote = this.connections[args.wsID];
    if (remote.role === "app-controller") {
      this.messageFromAppController(remote, event);
    } else if (remote.role === "page-controller") {
      this.messageFromPageController(remote, event);
    } else {
      this.messageFromRemoteClient(remote, event);
    }
  }

  messageFromAppController(remote, event) {
    // TODO process messages from App Controller
  }

  messageFromPageController(remote, event) {
    // broadcast the message from page controller to all connected remote clients
    Object.values(this.remoteClients).forEach(rc => rc.target.send(event.data));
    if (remote.messageHistory) remote.messageHistory.push(event.data);
  }

  messageFromRemoteClient(remote, event) {
    // TODO process messages from Remote Client
  }
}

