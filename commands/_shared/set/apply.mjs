import store from "utils/store/index.mjs";
import _ from 'lodash';
import { printToConsole } from "utils/printToConsole.mjs";

export async function execute(context) {
  try {

    const { args, argv } = context;
    
    const objectId = args[0];
    const key = args[1];
    const value = args[2];

    const object = store.get(objectId) || {};
    
    object[key] = value;

    // Do your thing!
    store.set(objectId, object);
    
    printToConsole(object);
        
  } catch (ex) {
    throw new Error(ex.message);
  }
}
