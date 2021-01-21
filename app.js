/** parse license information */
require("./license");

const { createApp, handleProcessSignals } = require("./utils/app-initializer");
const { connectDB } = require("./db/nosql");
const { environment } = require("./environment");
const apiRoutes = require("./routes/global.routes");
const https = require("https");
const fs = require("fs");
const { User } = require("./models/user.model");

function constructModule() {
  /** @param {import("express").Express} app*/
  function connectMongoDataBase(app) {
    return connectDB().then(() => app);
  }
  return {
    /** bootstrap the application server */
    startApplication() {
      return Promise.resolve()
        .then(createApp)
        .then(connectMongoDataBase)
        .then(registerApiRoutes)
        .then(startServer)
        .then(handleProcessSignals)
        .catch(console.error);
    },
  };

  /** @param {import("express").Express} app */
  function startServer(app) {
    console.log("binding socket...");
    return https
      .createServer(
        {
          key: fs.readFileSync("certs/server.key"),
          cert: fs.readFileSync("certs/server.cert"),
        },
        app
      )
      .listen(environment().port);
  }

  /** @param {import("express").Express} app */
  function registerApiRoutes(app) {
    app.use("/api", apiRoutes);
    return app;
  }
}

module.exports = constructModule();
