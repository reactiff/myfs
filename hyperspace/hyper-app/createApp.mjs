import App from "./controllers/app/HyperApp.mjs";

export default function createApp(schema, eventsHandlers) {
  return new Promise((resolve, reject) => {
    const app = new App(schema, {
      onReady: () => {
        resolve(app);
      },
    });
  });
}
