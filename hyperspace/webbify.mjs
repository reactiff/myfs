import inspectErrorStack from "utils/inspectErrorStack.mjs";
import HyperApp from "./hyper-app/HyperApp.mjs";

// CURRENTYLY, WEBBIFY IS LS'S BITCH AND WORKS ONLY FOR IT

export default function webbify(schema) {
  return new Promise((resolve, reject) => {
    (async () => {
      const app = await HyperApp.create(schema).catch(inspectErrorStack);
      const page = await app.open('/').catch(inspectErrorStack);

      debugger

      resolve([ page, app ])
    })();
  });
}

// Page HTML will be loaded from index.html file inside your appSchema.src folder
// All other html files in src folder will be loaded as templates, name same as the files less the ext.
// Or, you can send an html template from code like this...
// page.addTemplate('item', itemView());
