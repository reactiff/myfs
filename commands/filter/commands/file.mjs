import { ShowHelp } from "utils/help.mjs";

export async function execute(context) {
  try {
    const { args, argv } = context;
    return ShowHelp
  } catch (ex) {
    throw new Error(ex.message);
  }
}
