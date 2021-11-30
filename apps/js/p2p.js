const clientKeys = [];
const providerKeys = {
  'dom': [],
  'css': [],
};

class RelayService {
  constructor(ws) {
    this.ws = ws;
    this.clients = {};
    this.protocols = {
      'dom': {},
      'css': {},
    };
  }
  // this can only be called by a provider
  send(msg) { 
    // TODO not sure yet...
    this.clientBroadcast(msg);
  }
  registerClient(connection) {
    this.clients[connection.id] = connection;
  }
  unregisterClient(id) {
    delete this.clients[id];
    const keyIndex = clientKeys.findIndex(key => id);
    if (keyIndex >= 0) {
      clientKeys.splice(keyIndex, 1);
    }
  }
  registerProvider(provider) {
    this.protocols[provider.protocol][provider.providerId] = provider;
  }
  clientBroadcast(msg) {
    // TODO forward the message to the right channels
    //      perhaps not everyone needs to get it
    //      depending from whom.  
    //      Messages from Clients are probably only intended to providers.
    debugger
    const senderId = msg.currentTarget.headers["sec-websocket-key"];
    clientKeys.forEach(key => {
      if (key !== senderId) {
        this.clients[key]
          .target.send(msg)
      }
    });
  }
  providerBroadcast(e) {
    // TODO forward the message to the right channels
    //      perhaps not everyone needs to get it
    //      depending from whom.  
    //      Messages from Clients are probably only intended to providers.
    const protocol = e.currentTarget.protocol;
    providerKeys[protocol]
      .forEach(key => 
        this.protocols[protocol][key]
          .target.send(e));
  }
}

const services = {};

if ("WebSocket" in window) {
  function init() {
    var protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
    var address = protocol + window.location.host + window.location.pathname;
    var ws = new WebSocket(address, ['dom', 'css']);
    services.p2p = new RelayService(ws);

    ws.onopen = (e) => { 

      console.log('Page received a WS connection:', e);

      debugger
      p2p.registerClient({
        id: e.target.headers["sec-websocket-key"],
        target: e.target,
      });
     };

    ws.onclose = (e) => { 
      p2p.unregisterClient(e.target);
    };

    ws.onmessage = (e) => {
      console.log('rx:', e);
      debugger
      p2p.providerBroadcast(e);
    }

  }
}
