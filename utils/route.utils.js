const { fromBaseDir } = require("./path.utils");

const routeUtils = {
    /** @type {import("express").RequestHandler} */
    notFound(req, res, next){
        res.status(404).sendFile(fromBaseDir("views", "404.html"));
    }
}


module.exports = routeUtils;