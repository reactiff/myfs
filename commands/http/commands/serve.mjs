// import parseArgs from "utils/validation.mjs";
// import delegate from "utils/delegate.mjs";
// import myfs from "utils/myfs.mjs";
// import store from "utils/store.mjs";
// import _ from "lodash";
import chalk from "chalk";
import { printToConsole } from "utils/printToConsole.mjs";

// // import server from "server/originalCreateApp.mjs";
// import openPage from 'server/request/session.mjs';
// import Hypersource from 'hyperspace/Hypersource.mjs';

export const options = {
  V: {
    alias: "views",
    description: "View engine",
    type: "string",
    demand: false,
  },

  P: {
    alias: "port",
    description: "Port number to use instead of default :8181",
    type: "number",
    demand: false,
  },

  S: {
    alias: "src",
    description: "Source files path",
    type: "string",
    demand: false,
  },

  X: {
    alias: "ngrok",
    description: "Expose URL to the internet through ngrok",
    type: "boolean",
    demand: false,
  },

  H: {
    alias: "host",
    description: "Remost host name to expost localhost on",
    type: "string",
    demand: false,
  },
};

export async function execute(context) {
  try {

    const { args, argv } = context;
    
    // const { $0, app, ...params } = argv;

    const src = argv.src || argv.S;
    if (!src) {
      printToConsole(
        chalk.red(`Missing --src /relative or "absolute/path/from/root"`)
      );
      return;
    }

    // create server
    // const express = server.createApp({ ...params, name: app, src });

    // express.onLocalhostReady = () => {
    //   const session = express.open('/');
    //   session.onOpen = () => {
    //     debugger
    //     printToConsole();
    //   }
    // };

    // express.onRemoteHostReady = (remoteHost) => {

    //   debugger
    //   printToConsole('remote host available at:', remoteHost);

    //   // const session = express.open('/');
    //   // session.onOpen = () => {
    //   //   debugger
    //   //   printToConsole();
    //   // }
    // };

  } catch (ex) {
    throw new Error(ex.message);
  }
}
