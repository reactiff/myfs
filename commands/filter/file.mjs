// import parseArgs from "utils/validation.mjs";
// import delegate from "utils/delegate.mjs";
// import myfs from "utils/myfs.mjs";
// import store from "utils/store.mjs";
// import _ from "lodash";
import chalk from "chalk";
import { NothingToDo } from "utils/commandLoader";

// // import server from "server/originalCreateApp.mjs";
// import openPage from 'server/request/session.mjs';
// import Hypersource from 'hyperspace/Hypersource.mjs';

export const options = {
  S: {
    alias: "size",
    description: "File size",
    type: "string",
    demand: false,
  },
};

export async function execute(args, argv, resolve) {
  try {

    resolve(NothingToDo);

  } catch (ex) {
    throw new Error(ex.message);
  }
}
