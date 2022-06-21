import chalk from "chalk";
import WebSocket from "faye-websocket";
import { parseUrlParams } from "./parseUrlParams";

export default class HyperSocketServer {

  httpServer;
  connections = {};

  appController;

  pageControllers = {};
  pageControllerKeys = [];

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

    // "REMOTE" represents a web socket of the remote browser client, Page or App controller

    const route = req.url.split("?")[0].split('/').filter(t => t).join('/');
    const channel = params.channel || 'default';

    const connection = {
      params,
      name: params.name,
      role: params.role,
      route,
      channel,
      url: req.url,
      protocol: ws.protocol,
      target: event.target,
      currentTarget: event.currentTarget,
      channels: {} // for connections with different channels
    };
    Object.assign(this.connections[wsID], connection);

    if (params.role === "app-controller") {
      this.appController = connection;
    } 
    else if (params.role === "page-controller") {
      if (this.messageHistoryEnabled) connection.messageHistory = [];
      this.pageControllers[route] = connection;
      this.pageControllerKeys = Object.keys(this.pageControllers);
    } 
    else {
      event.target.clientId = wsID;
      const pageController = this.pageControllers[route];
      if (!pageController) return console.log(chalk.bgRed.white('page ' + route + ' does not exist'));
      const channel = this.getOrCreateChannel(pageController, channel);
      channel.remoteClients[wsID] = connection;
      channel.this.remoteClientKeys = Object.keys(channel.remoteClients);
      if (connection.messageHistory && connection.messageHistory.length) {
        connection.messageHistory.forEach(m => connection.target.send(m));
      }
      
      
      pageController.target.send("event:client-connected");
    }
  }

  getOrCreateChannel(pageController, channel) {
    if (!Reflect.has(pageController.channels, channel)) {
      pageController.channels[channel] = {
        remoteClients: {},
        remoteClientKeys: []
      }
    }
    return pageController.channels[channel];
  }
  
  connectionClosed(args, event) {
    const { req, socket, body, wsID, ws } = args;
    const conn = this.connections[wsID];
    if (conn.role === 'app-controller') {
      console.log(chalk.yellow(conn.role + " disconnected"));
    } else if (conn.role === 'page-controller') {
      console.log(chalk.yellow(conn.role + ` [${event.target.name}] disconnected`));
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

  messageFromAppController(app, event) {
    // TODO process messages from App Controller
  }

  messageFromPageController(pageController, event) {
    // broadcast the message from page controller to all connected remote clients
    Object.values(pageController.channels).forEach(channel => {
      Object.values(channel.remoteClients).forEach(rc => rc.target.send(event.data));
      if (pageController.messageHistory) pageController.messageHistory.push(event.data);  
    })
    
  }

  messageFromRemoteClient(remote, event) {
    // TODO process messages from Remote Client
  }
}

