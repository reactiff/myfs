import HyperApp from "./hyper-app/controllers/app/HyperApp.mjs";

export default function createApp(schema) {
  return new Promise((resolve, reject) => {
    const app = new HyperApp(schema);
    app.subscribe('onReady', (e) => {
      resolve(app);  
    });
  });
}
