import express from "express";
import path from "path";

// import _ from 'lodash';
import { processStateHooks } from "./processStateHooks.mjs";

function createSchemaServer(app) {
  return {
    render: (route, req, res) => {

      
      const anyview = route.view || app.staticLoaders.view;
      if (!anyview)
        throw new Error(
          "Could not find any views to load, are you sure you are in the right folder?  Ideally you want to be inside /src which should be adjacent to /public, they are siblings."
        );
      const baseView = anyview.getContent();
      const view = processStateHooks(baseView, app.state);
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Content-Length", Buffer.byteLength(view));

      // res.setHeader("Access-Control-Allow-Origin", app.host || "*");
      // if (app.host && app.host !== "*") {
      //   res.setHeader("Vary", "Origin");
      // }

      // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
      // res.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token");

      res.status(200).send(view);
    },
  };
}

function createFileServer(hyperApp, schema) {
  // hyperApp.express.use(express.static("public"));
  if (!schema.engine) {
    return;
  }
  if (schema.engine) {
    hyperApp.express.set("view engine", schema.engine);
    const viewsRoot = schema.src.slice(1).split("/")[0];
    const viewsPath = path.join(process.cwd(), schema.src);
    hyperApp.express.use(express.static(viewsRoot));
    hyperApp.express.set("views", viewsPath);
    if (viewsRoot !== "public") {
      const viewsPath = path.join(path.resolve(process.cwd()), schema.src);
      const staticPath = express.static(viewsPath);
      hyperApp.express.use("/static", staticPath);
    }
  }
  return null;
}

export function createViewEngine(hyperApp, schema) {
  switch (schema.engine) {
    case "hyper":
      return createSchemaServer(hyperApp, schema);
    default:
      return createFileServer(hyperApp, schema);
  }
}
