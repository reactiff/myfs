import createApp from 'hyperspace/createApp.mjs';
// import nomnoml from 'nomnoml';
import { ShowHelp } from "utils/help.mjs";
import inspectErrorStack from 'utils/inspectErrorStack.mjs';
import open from "open";
import logTrack from 'utils/logTrack.mjs';
import chalk from 'chalk';

// COMMAND MODULE PROPS
export const desc = `serve a hyper app`;
export const group = 'Utils';
export const options = {};

/**
 * Currently the SERVE command has hard-coded app configuration.
 * In the future, SERVE command is intended to be executed inside a directory
 * HTML, CSS and JS files.
 * 
 * A couple of important considerations:
 * 
 *  index.html      If root contain index.html, it will be loaded as the 
 *                    default html content, otherwise the default index.html will be used.  
 *  
 *  app.js          This file contains the App configuration JSON defining :
 *                    - State
 *                    - Routes
 *                    - Endpoints
 * 
 * 
 *  Component.js    Capitalized script files are treated as components.
 * 
 *  /pages          Folder containing page renderers.  Each renderer is a function of form:
                                      
                    e.g.:

                    export default function RenderMainPage(req, ctx) => {
                      const { page, app, html, res } = ctx;
                      return [
                        '<h1>{product.name}</h1>',
                        '<p>{product.description}</p>',
                        'Price: {product.price}',
                        '<a href="/shutdown">Shut down</a>'
                      ].join('');
                    }
        
 *  
 * 
 * 
 * 
 * 
 * @param {*} context 
 */

export async function execute(context) {
  try {
    const { argv } = context;

    // to store references to app, page etc.
    const globals = {};

    createApp({  
      state: {
        "product": {
          name: "Drill Bit",
          description: "Tungsten carbide drill bit for high speed drilling.",
          price: 199.0,
        }
      },
      pages: {
        '/': {
          render: (req, { page, app, html, res }) => {
            console.debug(chalk.bgGray.white('serving content'));
            return [
              '<h1>{product.name}</h1>',
              '<p>{product.description}</p>',
              'Price: {product.price}',
              '<a href="/shutdown">Shut down</a>'
            ].join('');
          },
        },
        '/shutdown': {
          render: (req, ctx) => {
            setTimeout(() => {
              console.debug(chalk.bgGray.white('SHUTTING DOWN'))
              process.exit(0);
            }, 3000);
            return 'App service will shut down in 3 seconds';
          }
        }
      },
      endpoints: {
        '/items/add': {
          method: 'POST',
          handler: (req, ctx) => {
            debugger
            const { data } = req.body;
            console.debug(chalk.bgGray.white('adding item ' + data))
            const { state } = ctx.page.getState();
            ctx.page.setState(state.items.concat(data));
          }
        }
      }
    })
      .then(app => {
        
        // store reference to app
        globals['app'] = app;

        console.debug(chalk.bgGray.white('navigating to ' + app.url));

        open(app.url)

        // start timer to automatically change
      })
      .catch(err => {
        console.debug(chalk.red('ERROR: ' + err.message));
        inspectErrorStack(err)
      });
    // return ShowHelp;
  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
