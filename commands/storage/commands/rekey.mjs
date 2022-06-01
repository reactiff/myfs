import store from "utils/store/index.mjs";
import _ from 'lodash';
import { EXISTS, NEXISTS } from "utils/special-chars/set-theory.mjs";

// COMMAND MODULE PROPS

export const command = 'rekey <key> <newKey>';
export const desc = `Rename existing key`;
export const group = 'Storage';

export async function execute(context) {
  try {

    const { args, argv } = context;

    debugger

    // test 1

    console.assert(store.has(argv.key) && !store.has(argv.newKey), `Assert failed: ${EXISTS}key AND ${NEXISTS}newKey` );

    store.rekey(
      argv.from,
      argv.to
    );

    // test 2

    console.assert(!store.has(argv.key) && store.has(argv.newKey), `Assert failed: ${NEXISTS}key AND ${EXISTS}newKey` );

    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
