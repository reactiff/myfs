import store from "utils/store/index.mjs";
import _ from 'lodash';

export async function execute(context) {
  try {

    const { args, argv } = context;
        
    store.show('include', (item) => decodeURIComponent(item));

    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
