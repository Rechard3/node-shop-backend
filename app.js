const https = require("https");
const fs = require("fs");

const { environment } = require("./environment");
const { createApp, handleProcessSignals } = require("./utils/app-initializer");
const { connectDB } = require("./db/nosql");
const { registerAppMiddleware } = require("./middleware/middleware");
const { apiRoutes } = require("./routes/global.routes");
const { logPath } = require("./middleware/devtools.middleware");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

function constructModule() {
  /** parse license information */
  require("./license");

  return {
    /** bootstrap the application server */
    startApplication() {
      return Promise.resolve()
        .then(createApp)
        // .then((app) => app.use(logPath))
        .then((app) => connectMongoDataBase(app))
        .then((app) => registerAppMiddleware(app))
        .then(app => registerApiRoutes(app))
        .then(app => registerPageNotFound(app))
        .then(app => startServer(app))
        .then(({ server, app }) => {
          handleProcessSignals(server);
          return { server, app };
        })
        .catch(err => {console.error(err); return {app: null, server: null}});
    },
    createApp,
    connectMongoDataBase,
    registerApiRoutes,
    startServer,
  };

  /** @param {Promise<import("express").Express>} app*/
  function connectMongoDataBase(app) {
    return connectDB().then((mongoose) => app);
  }

  /**
   * @param {import("express").Express} app
   * @returns {{server: import("https").Server, app: import("express").Express}} the server
   * (https) and the express app
   */
  function startServer(app) {
    console.log("binding socket...");
    const server = https
      .createServer(
        {
          key: fs.readFileSync("certs/server.key"),
          cert: fs.readFileSync("certs/server.cert"),
        },
        app
      )
      .listen(environment().port);
    return { server, app };
  }

  /** @param {import("express").Express} app */
  function registerApiRoutes(app) {
    app.use("/api", logPath, apiRoutes);
    return app;
  }

  /** @param {import("express").Express} app */
  function registerPageNotFound(app) {
    app.use(logPath, (req, res, next) => {
      res
        .status(StatusCodes.NOT_FOUND)
        .send({ status: ReasonPhrases.NOT_FOUND });
    });
    return app;
  }
}

module.exports = constructModule();
