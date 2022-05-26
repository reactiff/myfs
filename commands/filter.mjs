import parseArgs from "utils/validation.mjs";
import delegate from 'utils/delegate.mjs';
import { NothingToDo } from "utils/commandLoader.mjs";

// COMMAND MODULE PROPS
export const help = `fs filter lets you globally manage filter settings for searching files`;
export const group = 'File System';

export async function execute(args, argv, resolve, fsItem, context) {
  try {

    return NothingToDo;

  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
