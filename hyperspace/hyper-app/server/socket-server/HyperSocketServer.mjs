import chalk from "chalk";
import WebSocket from "faye-websocket";
import logTrack from "utils/logTrack.mjs";
import { printToConsole } from "utils/printToConsole.mjs";
import { parseUrlParams } from "./parseUrlParams.mjs";

export default class HyperSocketServer {

  hyperServer;
  app;

  httpServer;
  connections = {};

  appController;

  pageControllers = {};
  pageControllerKeys = [];

  constructor(hyperServer) {
    this.hyperServer = hyperServer;
    this.app = hyperServer.app;
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
    
    const { req, socket, body, wsID, ws } = args;
    const params = parseUrlParams(event.target.url);

    // "REMOTE" represents a web socket of the remote browser client, Page or App controller

    const routeTokens = req.url.split("?")[0].split('/').filter(t => t);
    if (routeTokens.length===0) {
      routeTokens.push('index');
    }
    const route = '/' + routeTokens.join('/');
    const channel = params.channel || 'default';
    
    const destination = channel ? route + '/' + channel : route;

    logTrack('HyperSocketServer', 'ws: ~~> | New connection from ' + params.role);

    const conn = {
      params,
      name: params.name,
      role: params.role,
      route,
      channel,
      url: req.url,
      protocol: ws.protocol,
      target: event.target,
      currentTarget: event.currentTarget,
      channels: {} // for connections with different channels,
    };

    Object.assign(this.connections[wsID], conn);

    if (params.role === "app-controller") {

      // APP controller connected
      
      this.appController = conn;
    } 
    else if (params.role === "page-controller") {

      // Hyper PAGE controller connected

      const pageId = params.id;

      conn.ref = this.app._pages[pageId];
      conn.messageHistory = [];
      this.pageControllers[route] = conn;
      this.pageControllerKeys = Object.keys(this.pageControllers);
      conn.target.send("event:onReady");
    } 
    else {

      // Remote Client connected

      event.target.clientId = wsID;
      const pageController = this.pageControllers[route];
      if (!pageController) return printToConsole(chalk.bgRed.white('page ' + route + ' does not exist'));

      // Get or create channel (its either for single client or multi client chat)
      const channel = this.getOrCreateChannel(pageController, conn.channel);
      channel.remoteClients[wsID] = conn;
      channel.remoteClientKeys = Object.keys(channel.remoteClients);
      if (conn.messageHistory && conn.messageHistory.length) {
        conn.messageHistory.forEach(m => conn.target.send(m));
      }

      // Send page resources (scripts, styles, state etc)
      pageController.ref.initializeClient(conn);

      pageController.target.send("event:onClientConnect");
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
      printToConsole(chalk.yellow(conn.role + " disconnected"));
    } else if (conn.role === 'page-controller') {
      printToConsole(chalk.yellow(conn.role + ` [${event.target.name}] disconnected`));
    } else {
      printToConsole(chalk.yellow(`remote client [${wsID}] disconnected`), wsID);
    }
    delete this.connections[wsID]; 
  }

  ///////////////////////////////////////////// MESSAGES 

  processMessage(args, event) {
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
    debugger
  }

  messageFromPageController(pageController, event) {

    debugger

    // TODO: Look for => registerPageController action


    // broadcast the message from page controller to all connected remote clients
    const channels = Object.values(pageController.channels);
    
    // watch it relay the message to remote page clients
    if (channels.length > 0) {
      debugger
    }

    channels.forEach(channel => {
      const clients = Object.values(channel.remoteClients);
      clients.forEach(rc => rc.target.send(event.data));
      if (pageController.messageHistory) pageController.messageHistory.push(event.data);  
    })
  }

  messageFromRemoteClient(remote, event) {

    // TODO process messages from Remote Client
    
    debugger

  }
}

