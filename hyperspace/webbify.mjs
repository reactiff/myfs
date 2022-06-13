import createApp from "hyperspace/createApp.mjs";
import chalk from "chalk";
import inspectErrorStack from "utils/inspectErrorStack.mjs";

// CURRENTYLY, WEBBIFY IS LS'S BITCH AND WORKS ONLY FOR IT

export default function webbify(schema) {
  return new Promise((resolve, reject) => {
 
    // 1. Create HyperApp instance
    
    createApp(schema)
      .catch(inspectErrorStack)
      .then((hApp) => {

        // Open a page request
        hApp.requestPage("/")
          .catch(inspectErrorStack)
          .then((page) => {

            page.onError((msg) => {
              console.log(chalk.red(msg))
            });

            page.onAction(action => console.log("Action received", action));
            
            page.initialize();

            resolve([ page, hApp ]);
          });
      });
  });
}

// Page HTML will be loaded from index.html file inside your appSchema.src folder
// All other html files in src folder will be loaded as templates, name same as the files less the ext.
// Or, you can send an html template from code like this...
// page.addTemplate('item', itemView());
