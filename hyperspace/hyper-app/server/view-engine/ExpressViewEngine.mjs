import path from "path";
import chalk from "chalk";

export default class ExpressViewEngine {
    constructor(hyperServer) {
        this.hyperServer = hyperServer;
        this.init(hyperServer);
    }

    
    init(hyperServer) {

        const { app, express } = hyperServer;
        const { schema } = app;
        
        express.set("view engine", schema.engine);

        const viewsRoot = schema.src.slice(1).split("/")[0];
        const viewsPath = path.join(process.cwd(), schema.src);
        express.use(express.static(viewsRoot));

        express.set("views", viewsPath);
        if (viewsRoot !== "public") {
            const viewsPath = path.join(path.resolve(process.cwd()), schema.src);
            const staticPath = express.static(viewsPath);
            express.use("/static", staticPath);
        }

        // TODO resolve: WHAT IS ALL THIS?

        const c1 = process.cwd();
        const c2 = schema.publicFolder;
        
        const parentFolder = c1.slice(0, c1.length - 3);
        const pathToPublic = path.resolve(path.join(parentFolder, c2));

        console.log('-', chalk.rgb(250,128,30)(`Public folder set to ${pathToPublic}`));
        express.use(express.static(pathToPublic));
    }

    render(route, req, res) {
        res.render(req.path + "index", { request: req });
    }
}
