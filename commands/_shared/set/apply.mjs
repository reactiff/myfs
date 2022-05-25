import store from "utils/store.mjs";
import _ from 'lodash';
import delegate from 'utils/delegate.mjs';

export async function execute(args, argv, resolve, fsitem) {
  try {
    
    const objectId = args[0];
    const key = args[1];
    const value = args[2];

    const object = store.get(objectId) || {};
    
    object[key] = value;

    // Do your thing!
    store.set(objectId, object);
    
    console.log(object);
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
