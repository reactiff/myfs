import inspectErrorStack from "utils/inspectErrorStack.mjs";
import createApp from "./createApp.mjs";

export default function webbify(schema) {
  return new Promise((resolve, reject) => {
    (async () => {

      const app = await createApp(schema)
        .catch(inspectErrorStack);

        const page = await app.open('/')
        .catch(inspectErrorStack);
      debugger

      resolve([ page, app ])
    })();
  });
}

