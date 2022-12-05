import createApp from "../hyperspace/createApp.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import Socket from "../hyperspace/hyper-app/controllers/Socket.mjs";
import HyperServer from "../hyperspace/hyper-app/server/HyperServer.mjs";
import HyperApp from "../hyperspace/hyper-app/controllers/app/HyperApp.mjs";
import http from "http";
import { jest } from "@jest/globals";

jest.setTimeout(600000);

// helpers
function asyncError(ex) {
  inspectErrorStack(ex);
  throw new Error(ex.message || ex);
}

// setup and teardown
beforeAll(() => {
  return new Promise((resolve, reject) => {
    
    resolve();
  });
});

// beforeEach(() => {
//   return new Promise((resolve, reject) => {
//     resolve();
//   });
// });

afterEach(() => {
  return new Promise((resolve, reject) => {
    resolve();
  });
});

afterAll(() => {
  return new Promise((resolve, reject) => {
    resolve();
  });
});

// CREATION

test("app can be created with no schema at all (uses defaults)", done => {
  
  debugger;

  

  function testApp(app) {
    expect(app).toBeDefined();
    expect(app._pages['/']).toBeDefined();

    debugger;

    // Request the page and see that the response comes back correctly
    http.get('http://localhost:8484', (res) => {
    
      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      // The whole response has been received. Print out the result.
      res.on('end', () => {

        // the response should contain the HTML from above
        const containsCorrectText = data.indexOf("Welcome Home") >= 0;
        if (containsCorrectText) {
                    
          setTimeout(() => {
            
            debugger
            app.close(() => {
              done(); // SUCCESS
            });

          }, 100);
          

        }

      });

    }).on("error", (error) => {
      debugger
      throw new Error(error.message || error);
    });
    
  }

  createApp({  
    pages: {
      '/': {
        render: (req, { page, app, html, res }) =>
          "<h1>Welcome Home</h1>",
        // state:      {},
        // scripts:    [],
        // styles:     [],
        // templates:  { "product": "<ul><li>{sku}</li><li>{name}</li></ul>" },
        // actions:    { "doSomething": () => {} },
        // hooks:      { "path.to": () => {} },
      }
    }
  })
    .then(app => testApp(app))
    .catch(asyncError);
});

// test("app can be created with just name in schema", async () => {
//   const app = await createApp({ name: 'MyApp' }).catch(asyncError);
//   // const page = await app.open('/').catch(asyncError);
//   expect(app).toBeInstanceOf(HyperApp);
//   app.name = 'MyApp';
//   app.title = 'My App';
//   expect(app.ready).toBe(true);
// });

// test("app with name and title", async () => {
//   const app = await createApp({
//     name: 'MyApp',
//     title: 'Test App',
//   }).catch(asyncError);
//   app.schema.name = 'MyApp';
//   app.schema.title = 'Test App';
//   expect(app.ready).toBe(true);
// });

// test("app schema with state", async () => {
//   const app = await createApp({
//     name: 'MyApp',
//     state: {
//       apples: 5,
//       oranges: 0
//     },
//   }).catch(asyncError);
//   const state = app.getState();
//   expect(state.apples + state.oranges).toBe(5);
//   expect(app.ready).toBe(true);
// });

// test("app is ready and has all modules initialized and ready", async () => {
//   const app = await createApp({ name: 'MyApp' }).catch(asyncError);
//   expect(app.ready).toBe(true);
//   // socket
//   expect(app._socket).toBeInstanceOf(Socket);
//   expect(app._socket.ready).toBe(true);
//   // hyper server
//   expect(app.server).toBeInstanceOf(HyperServer);
//   expect(app.server.ready).toBe(true);
// });

// test("app's optional schema properties are auto-filled", async () => {
//   const app = await createApp().catch(asyncError);
//   expect(app.ready).toBe(true);
//   expect(app._socket).toBeInstanceOf(Socket);
//   expect(app._socket.status).toBe('connected');
//   expect(app.server).toBeInstanceOf(HyperServer);
//   expect(app.server.status).toBe('connected');
// });

// test("app schema with config", async () => {
//   const app = await createApp({
//     port: 9090
//   }).catch(asyncError);
//   expect(app.ready).toBe(true);
//   expect(app.server.port).toBe(9090);
// });

// // ADDING A PAGE

// // reusable helper functions from here
// async function helpCreateApp(schema = {}) {
//   const app = await createApp({ ...schema, ...{ events: { onReady: jest.fn() } }}).catch(asyncError);
//   expect(app.schema.events.onReady).toHaveBeenCalled();
//   expect(app.ready).toBe(true);
//   return app;
// }

// test("add a page", (done) => {

//   (async () => {

//     const app = await helpCreateApp({ port: 9090 });

//     const page = await app.addPage('/hello', {
//       html:       '<h1>Welcome to my store</h1><div id="root"></div>',
//       // state:      {},
//       // scripts:    [],
//       // styles:     [],
//       // templates:  { "product": "<ul><li>{sku}</li><li>{name}</li></ul>" },
//       // actions:    { "doSomething": () => {} },
//       // hooks:      { "path.to": () => {} },
//     });

//     // request the page

//     // not like this
//     // await page.open().catch(inspectErrorStack);

//     // but like this

//     const options = {
//       hostname: 'localhost',
//       port: 9090,
//       path: '/hello',
//       method: 'GET',
//     };

//     const req = http.request(options, res => {

//       debugger

//       // the response should contain the HTML from above

//       console.log(`statusCode: ${res.statusCode}`);

//       const data = res.read();

//       console.log(data)
//     });

//     req.on('error', error => {
//       console.error(error);
//     });

//     req.end();

//   })();

// });

// test("app schema with pages as ", async () => {
//   const app = await createApp({
//     port: 9090
//   }).catch(asyncError);
//   expect(app.ready).toBe(true);
//   expect(app.server.port).toBe(9090);
// });

/**
 * // TODO
 *
 *    STATE PROPAGATION
 *
 *    [ ] set new state and see that the entire state is a new instance
 *    [ ] change something in state and see that it is changed but the state instance is the same
 *    [ ] subscribe to changes in state at given path
 *    [ ] update app state and see that page.getState() reflects the change
 *        because StateManager getState() returns combined state,
 *
 *          i.e.
 *
 *          getState() {
 *            return { ...this.parent.getState(), ...this._state };
 *          }
 *
 */

/**
 * // TODO: test client page p2p.js
 *
 *    CLIENT SIDE
 *
 *    [ ] websocket creation and connectivity
 *    [ ] page can receive messages from controller
 *    [ ] page can send messages to controller
 *    [ ] page can send messages to another peer (the test itself) with server acting as relay
 *    [ ] page can receive and handle actions
 *    [ ] page supports "addHook" action which subscribes to state changes at path
 *    [ ] page can receive and process "setState" and "updateState"
 *    [ ] page hooks get called when relavant state changes occur (make it echo back a secret)
 *        [ ] a hook can execute a function call on the page
 *        [ ] a hook causes re-rendering of the page partial or full with new data including
 *            iteration of items and mering item templates with item data
 *
 *
 *
 */
