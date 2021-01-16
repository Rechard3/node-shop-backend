/** parse license information */
require("./license");


const { initApp, handleProcessSignals } = require("./utils/app-initializer");
const { connectDB } = require("./db/nosql");
const { environment } = require("./environment");
const apiRoutes = require("./routes/global.routes");
const { registerAppMiddleware } = require("./utils/middleware");
const https = require("https");
const fs = require("fs");
const { User } = require("./models/user.model");

Promise.resolve()
  .then(() => {
    console.log("initializing applicaiton...");
    const app = initApp();
    return app;
  })
  .then((app) => {
    console.log("connecting to database...");
    return connectDB().then(() => app);
  })
  .then((app) => registerAppMiddleware(app))
  .then((app) => {
    app.use(function (req, res, next) {
      if (!req.session.user) {
        User.findOne({ email: "anonymous" }).then((user) => {
          req.session.user = user;
          next();
        });
      } else {
        next();
      }
    });
    return app;
  })
  .then((app) => app.use("/api", apiRoutes))
  .then((app) => {
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
  })
  .then((server) => {
    handleProcessSignals(server);
    console.info(
      "*".repeat(100),
      "\napp is listening on ",
      environment().port,
      "\n" + "*".repeat(100)
    );
  })
  .catch(console.error);
