import open from "open";
import { v4 as uuid } from "uuid";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import createPageSocket from "./createPageSocket.mjs";
import createPage from "./Page.mjs";

function createPageRequest(app, route) {
  return new Promise((resolve) => {
    const { schema } = app;

    let scope = {
      resolve,
      pageResolved: false,
      requestId: uuid(),
      route,
      sendAction: (data) => { 
        const msg = "action:" + JSON.stringify(data);
        scope.ws.send(msg);
      },
      sendState: (data) => { 
        const msg = "state:" + JSON.stringify(data);
        scope.ws.send(msg) ;
      },
    };
    
    scope.page = createPage(app, scope);

    scope.ws = createPageSocket(app, scope)

    open("http://localhost:" + schema.port + route);
  });
}

export function requestPage(route) {
  const app = this;
  return new Promise((resolve) => {
    createPageRequest(app, route)
      .then(page => resolve(page))
      .catch(inspectErrorStack);
  });
}

export default requestPage;
