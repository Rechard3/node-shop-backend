const {environment} = require("../environment");

function constructModule(){

    
    return {
        logPath: environment().dev ? logPath : nop,
    };


    /** @type {import("express").RequestHandler} */
    function nop(req, res, next){
        next();
    }

    /** @type {import("express").RequestHandler} */
    function logPath(req, res, next){
        try{
            throw new Error();
        }catch (stackTrace){
            console.info("[DEVTOOLS URL] ", req.url, stackTrace);
            next();
        }
    }
}

module.exports = constructModule();