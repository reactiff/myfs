import { ShowHelp } from "utils/help.mjs";

export const options = {
  S: {
    alias: "size",
    description: "File size",
    type: "string",
    demand: false,
  },
};

export async function execute(context) {
  try {

    const { args, argv } = context;
    

    return ShowHelp

  } catch (ex) {
    throw new Error(ex.message);
  }
}
