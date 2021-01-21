const { environment } = require("../environment");
const bodyparser = require("body-parser");
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const { registerAppMiddleware } = require("../middleware/middleware");

function constructModule() {
  /**
   * register all middleware defined in this module
   * @param {import("express").Express} app the express instance to register with
   * @returns {import("express").Express} the express instance passed in 'app'
   */
  function registerGenericConfig(app) {
    /**  */
    registerAppMiddleware(app);

    app.use(cookieParser()); // needed for session csrf
    // register body parser
    app.use(bodyparser.json());

    app.use((req, res, next) => {
      console.log("processing request to: ", req.path);
      next();
    });

    /* register csrf token with the request */
    app.use(csrf());
    // app.all("*", (req, res, next) => {
    //   res.cookie("XSRF-TOKEN", req.csrfToken());
    //   next();
    // });

    return app;
  }

  // return the exported object
  return {
    /**
     * @returns {import("express").Express} express app with middleware registered
     */
    createApp() {
      console.log("creating express application");
      return express();
    },

    /** @param {import("express").Express} app */
    registerStaticFiles(app) {
      app.use(
        express.static(path.resolve(path.join(environment().baseDir, "public")))
      );
      return app;
    },

    /** register cleanup handlers
     * @param {Server} server the Server intance created by app.listen()
     *
     */
    handleProcessSignals(server) {
      console.info(
        "*".repeat(100),
        "\napp is listening on ",
        environment().port,
        "\n" + "*".repeat(100)
      );

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
    },
  };
}

module.exports = constructModule();
