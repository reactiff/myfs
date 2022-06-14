import HyperApp from "hyperspace/HyperApp.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";

// This module's job is to facilitate the creation of HyperApp
// merging custom and default options, as well as doing the hand shaking
// this file doesn't know anything about the business of ls command
// or its webService henchmen.

const defaultOptions = {
  // view: schemaOptions.view,
  routes: null,
  engine: "hyper",
  port: 8585,
  public: false,
  deploy: false,
};

const extendDefaultOptions = (schemaOptions) => {
  const options = Object.assign(
    {}, defaultOptions, schemaOptions
  );
  return options;
};

export default function createApp(schemaOptions = {}) {
  return new Promise((resolve) => {
    const appSchema = extendDefaultOptions(schemaOptions);
    HyperApp.create(appSchema)
      .then(resolve)
      .catch(inspectErrorStack);
  });
}
