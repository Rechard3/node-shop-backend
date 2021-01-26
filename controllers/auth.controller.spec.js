process.env["NODE_ENV"] = "test";
envPath = require("path").resolve(__dirname, "../env/dev.env");
require("dotenv").config({ path: envPath });
require("mongoose");
const _ = require("lodash");

const express = require("express");
const run = require("express-unit");

const { connectDB } = require("../db/nosql");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const { authenticate } = require("./auth.controller");

describe("Auth Controllers", function () {
  /** @type {import("express").Express */ let app;

  beforeAll(async function () {
    app = express();
    const db = await connectDB(app);
  });

  describe("login", function () {
    it("should allow user to login", async function (done) {
      resSpy = {};
      console.log("awaiting run");
      const [err, req, res] = await run(function (req, res, next) {
        req.session = {};
        req.session.isAuthenticated = false;
        req.session.roles = [];
        req.body = {
          username: "coco",
          password: "chanelle",
        };
        spyOn(res, "status").and.callThrough();
        spyOn(res, "send").and.callThrough();
        console.log("nexting");
        next();
      }, authenticate);

      expect(res.statusCode).toBeDefined();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        status: ReasonPhrases.UNAUTHORIZED,
      });
      done();
    });

    it("should allow a registered user to login succesfully", async function (done) {
      // first create a dummy user object
      const { User } = require("../models/user.model");
      const dummyUser = {
        username: "u1",
        password: "password",
        email: "u1@example.net",
      };
      const { hash } = require("bcrypt");
      const password = await hash(dummyUser.password, 12);
      await new User({ ...dummyUser, password }).save();

      const [err, req, res] = await run(function (req, res, next) {
        req.session = {};
        req.body = _.pick(dummyUser, ["username", "password"]);
        spyOn(res, "status").and.callThrough();
        spyOn(res, "send").and.callThrough();
        next();
      }, authenticate);

      expect(err).toBeFalsy();
      expect(res.status).toHaveBeenCalledOnceWith(StatusCodes.OK);
      expect(res.send).toHaveBeenCalled();
      done();
    });
  });
});
