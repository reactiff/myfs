import chalk from "chalk";
import logTrack from "utils/logTrack.mjs";
import mergeTemplateAndState from "./mergeTemplateAndState.mjs";

export default class HyperViewEngine {
    constructor(hyperServer) {
        this.hyperServer = hyperServer;
    }

    handlePageRequest(req, res, page) {

        logTrack('HyperViewEngine', '~~> ' + req.url);
        
        ///

        res.setHeader("Content-Type", "text/html; charset=UTF-8");

        let html = this.hyperServer.static.baseHtml.getContent();

        if (page.render) {
            const content = page.render(req, { 
                res,
                page,
                app: this.hyperServer.app,
                html
            });

            // happens when response has been sent from within render()
            if (!content) return;

            html = html.replace('{content}', content)
            
        }
                        
        logTrack('HyperViewEngine', chalk.bgRed.white('content sent without merging state'));
        

        // TODO FIX THIS

        //html = mergeTemplateAndState(html, page.getState());

        // res.setHeader("Access-Control-Allow-Origin", app.host || "*");
        // if (app.host && app.host !== "*") {
        //   res.setHeader("Vary", "Origin");
        // }
        // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
        // res.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token");

        res.setHeader("Content-Length", Buffer.byteLength(html));
        res.status(200).send(html);
    }

    
    handleEndpointRequest(req, res, endpoint) {

        debugger
        logTrack('HyperViewEngine', req.protocol + ': ~~> endpoint request: ' + req.url)
        
        ///

        res.setHeader('Content-Type', 'application/json');

        const data = endpoint.handle(req, { 
            endpoint,
            app: this.hyperServer.app,
        });
                
        res.json(data);

    }
}
