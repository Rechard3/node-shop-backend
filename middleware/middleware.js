const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const pipe = require("lodash/fp/pipe");

const { environment } = require("../environment");
const { checkAuthenticity } = require("./auth.middleware");

function constructModule() {

  return {
    /** @param {import("express").Express} app */
    registerAppMiddleware: pipe(
      registerExpressSession,
      registerAuthMiddleware,
      registerGenericMiddleware
    ),
  };

  /** @param {import("express").Express} app */
  function registerExpressSession(app) {
    return app.use(
      session({
        secret: environment().sessionSecret,
        store: new MongoStore({mongooseConnection: mongoose.connection, collection: "sessions"}),
        cookie: { httpOnly: true, secure: false, path: "/", sameSite: false },
        resave: false,
        saveUninitialized: false,
      }) 
    );
  }

  /** @param {import("express").Express} app */
  function registerAuthMiddleware(app) {
    return app.use(checkAuthenticity);
  }

  /** @param {import("express").Express} app */
  function registerGenericMiddleware(app) {
    app.use(staticFiles());
    app.use(bodyParser.json());
    return app;
  }

  /** @param {import("express").Express} app */
  function staticFiles() {
    return express.static(
      path.resolve(path.join(environment().baseDir, "public"))
    );
  }
}

module.exports = constructModule();
