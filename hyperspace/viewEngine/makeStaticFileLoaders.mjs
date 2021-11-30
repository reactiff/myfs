import path from "path";
import fs from "fs";
import staticHotUpdate from "./staticHotUpdate.mjs";
import chalk from "chalk";
export function makeStaticFileLoaders(schema, handlers) {

  if (!schema.src) { return; }
  let dirItems = fs.readdirSync(schema.src);

  const loaders = {
    view: null,
    templates: [],
    styles: [],
  };

  let cssCount = 0;
  let htmlCount = 0;

  for (let file of dirItems) {
    const ext = path.extname(file).slice(1);
    const baseName = path.basename(file, `.${ext}`);

    if (file === "index.html") {
      const options = { 
        ...schema, 
        hotUpdate: false
      };
      loaders.view = new staticHotUpdate(file, options); 

      // do not hotupdate base html
    } else if (file.endsWith(".html")) {
      htmlCount++;

      const loader = new staticHotUpdate(file, schema);
      loader.onUpdate(handlers.onTemplateHotUpdate);
      loaders.templates.push({ name: baseName, loader });

    } else if (file.endsWith(".css")) {
      cssCount++;

      const loader = new staticHotUpdate(file, schema);
      loader.onUpdate(handlers.onStyleHotUpdate);
      loaders.styles.push({ name: baseName, loader });

    }
  }

  if (cssCount===0) {
    console.log('-', chalk.rgb(250,128,30)(`No hot-reloadable CSS files found in ${schema.src}`));
  }

  if (htmlCount===0) {
    console.log('-', chalk.rgb(250,128,30)(`No html templates found in ${schema.src}`));
  }
  return loaders;
}

