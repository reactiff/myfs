import inspectErrorStack from "utils/inspectErrorStack.mjs";
import webbify from "hyperspace/webbify.mjs";
import path from 'path';
import myfs from "utils/myfs.mjs";

// COMMAND MODULE PROPS
export const desc = `Serve a virtual Web App using schema.*.json configuration`;
export const group = 'Web Apps';

export async function execute(context) {
  try {

    const { args, argv } = context;
    
    myfs.match('schema.*').then(
      files => {
        const schema = files.first().json();
        schema.port = argv.port || 8080;
        schema.hotUpdate = argv.hot || false, 
        schema.src = path.resolve(process.cwd());
        webbify(schema)
          .then(([page, app]) => {});
      }
    );

  } catch (ex) {
    inspectErrorStack(ex);
  }
}
