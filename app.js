const { initApp, handleProcessSignals } = require("./utils/app-initializer");
const { connectDB } = require("./db/nosql");
const { environment } = require("./environment");
const apiRoutes = require("./routes/global.routes");
const { registerAppMiddleware } = require("./utils/middleware");

Promise.resolve()
  .then(() => {
    console.log("initializing applicaiton...");
    const app = initApp();
    app.use("/api", apiRoutes);
    return app;
  })
  .then((app) => {
    console.log("connecting to database...");
    return connectDB().then(() => app);
  })
  .then((app) => registerAppMiddleware(app))
  .then((app) => {
    console.log("binding socket...");
    return app.listen(environment().port);
  })
  .then((server) => {
    handleProcessSignals(server);
    console.info(
      "*".repeat(100),
      "\n",
      "app is listening on ",
      environment().port,
      "\n",
      "*".repeat(100)
    );
  })
  .catch(console.error);
