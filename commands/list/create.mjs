import store from "utils/store/index.mjs";
import _ from 'lodash';

export async function execute(args, argv, resolve, fsitem) {

  try {

    
    store.show('include', (item) => decodeURIComponent(item));

    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
