const { environment } = require("../environment");
const bodyparser = require("body-parser");
const cors = require("cors");
const express = require("express");
const path = require("path");


function constructModule() {
  /**
   * register all middleware defined in this module
   * @param {import("express").Express} app the express instance to register with
   * @returns {import("express").Express} the express instance passed in 'app'
   */
  function registerGenericConfig(app) {
    // register body parser
    app.use(bodyparser.json());
    // register cors
    app.use(cors({ allowedHeaders: "*" }));
    return app;
  }

  // return the exported object
  return {
    /**
     * @returns {import("express").Express} express app with middleware registered
     */
    initApp() {
      // create the express app
      const app = express();
      registerGenericConfig(app);
      // register static files path
      app.use(
        express.static(path.resolve(path.join(environment().baseDir, "public")))
      );

      return app;
    },

    /** register cleanup handlers
     * @param {Server} server the Server intance created by app.listen()
     * 
    */
    handleProcessSignals(server){
      process.on("SIGTERM", () => {
        console.log("received SIGTERM, closing gracefully...");
        server && server.close(0);
        process.exit(0);
      });
  
      process.on("SIGINT", () => {
        console.log("received SIGINT, closing gracefully...");
        server && server.close();
        process.exit(0);
      });

      return server;
    }
  };
}

module.exports = constructModule();
