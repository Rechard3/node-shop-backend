const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { environment } = require("../environment");
const {checkAuthenticity} = require("./auth.middleware");

function constructModule() {
  const mongoUri = `mongodb+srv://${environment().dbUser}:${
    environment().dbPass
  }@cluster0.njw0u.mongodb.net/${environment().db}?retryWrites=true&w=majority`;

  const store = new MongoDBStore({ uri: mongoUri, collection: "UserSession" });

  return {
    /** @param {import("express").Express} app */
    registerAppMiddleware(app) {
      registerExpressSession(app);
      registerAuthMiddleware(app);

      return app;
    },
  };

  function registerExpressSession(app) {
    app.use(
      session({
        secret: environment().sessionSecret,
        store,
        cookie: { httpOnly: true, secure: false, path: "/", sameSite: false},
        resave: false,
        saveUninitialized: true,
      })
    );
  }

  /** @param {import("express").Express} app */
  function registerAuthMiddleware(app) {
    app.use(checkAuthenticity);
    return app;
  }
}

module.exports = constructModule();