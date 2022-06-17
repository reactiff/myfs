import mergeTemplateAndState from "./mergeTemplateAndState.mjs";

export default class HyperViewEngine {
    constructor(hyperServer) {
        this.hyperServer = hyperServer;
    }

    render(route, req, res) {

        // TODO currently defaults to index.html for any route
        const indexView = this.hyperServer.static.indexHtml;

        if (!indexView)
            throw new Error(
                "Could not find any views to load, are you sure you are in the right folder?  Ideally you want to be inside /src which should be adjacent to /public, they are siblings."
            );

        const template = indexView.getContent();
        const content = mergeTemplateAndState(template, this.hyperServer.app.state);
        
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.setHeader("Content-Length", Buffer.byteLength(content));

        // res.setHeader("Access-Control-Allow-Origin", app.host || "*");
        // if (app.host && app.host !== "*") {
        //   res.setHeader("Vary", "Origin");
        // }
        // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        // res.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token");
        res.status(200).send(content);
    }
}
