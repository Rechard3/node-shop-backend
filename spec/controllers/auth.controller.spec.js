process.env["NODE_ENV"] = "test";

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { response } = require("express");

const { startApplication } = require("../../app");
const {
  addUser,
  authenticate,
  deleteUser,
  readUser,
  updateUser,
} = require("../../controllers/auth.controller");
const { User } = require("../../models/user.model");
const { environment } = require("../../environment");
const { clearConsole } = require("../helpers/console.helpers");
describe("Auth Controller", function () {
  describe("GET /auth/", function () {
    let sessionCookie = "";
    /** @type {import("express").Express} */
    let app;
    /** @type {import("https").Server} */
    let server;
    const registeredUser = {
      username: "testuser",
      password: "somePass",
      email: "no-reply@example.net",
    };

    beforeAll(async function () {
      const appServer = await startApplication();
      app = appServer.app;
      server = appServer.server;
      await User.deleteMany();
      const user = await User.createUser(registeredUser);
      return;
    });

    afterAll(async function () {
      await User.deleteMany();
      server.close();
    });

    it("should be able to login and return a session cookie", async function (done) {
      const users = await User.find().exec();
      return request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .send(registeredUser)
        .expect(function (res) {
          expect(res.status).toEqual(StatusCodes.OK);
          // if (!res.get("Set-Cookie").find((cookie) => /session/.test(cookie)))
          //   throw new Error("response doesn't contain session cookie");
          done();
        });
    });

    it("should return a session cookie", async function () {});
  });

  describe("POST /api/auth/login", function () {
    /** @type {import("express").Express} */
    let app;
    /** @type {import("https").Server} */
    let server;

    const c = clearConsole();

    /** list of users to be registered before the tests begin */
    const registeredUsers = _.times(2, (n) => ({
      username: `ruser${n}`,
      password: "somepass",
      email: "r.user@mail.com",
      dateofbirth: new Date(),
      firstname: "registered",
      lastname: "user",
    }));

    beforeAll(async function () {
      const temp = await startApplication();
      app = temp.app;
      server = temp.server;
      await User.deleteMany();
      return await Promise.all(
        registeredUsers.map((user) => User.createUser(user))
      ).catch(console.error);
    });

    afterAll(async function () {
      await User.deleteMany();
      server.close();
    });

    it("should have some users registered", async function (done) {
      await User.find((err, users) => {
        expect(users.length).toEqual(registeredUsers.length);
        done();
      });
    });

    it("Should be able to login with a valid user", async function (done) {
      loginWith(registeredUsers[0], done)
        .expect((res) => {
          if (_.has(res.body, "model.username")) return;
          throw new Error("response did not contain all properties");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("should not allow login with unregistered user", async function (done) {
      const users = await User.find().exec();
      loginWith({ ...registeredUsers[0], username: `${Math.random()}` }, done)
        .expect((res) => {
          expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
          expect(res.body).not.toContain("model");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("should not allow login with invalid credentials [1]", async function (done) {
      loginWith({ ...registeredUsers[0], password: "" }, done)
        .expect((res) => {
          expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
          expect(res.body).not.toContain("model");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("should not allow login with invalid credentials [2]", async function (done) {
      loginWith({ ...registeredUsers[0], password: `${Math.random()}` }, done)
        .expect((res) => {
          expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
          expect(res.body).not.toContain("model");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("should not allow login with invalid credentials [3]", async function (done) {
      const loginReq = loginWith(
        {
          ...registeredUsers[0],
          password: registeredUsers[0].username,
        },
        done
      );
      loginReq
        .expect((resp) => {
          expect(resp.status).toEqual(StatusCodes.UNAUTHORIZED);
          expect(resp.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
          expect(resp.body).not.toContain("model");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    function loginWith(creds, done) {
      return request(app)
        .post("/api/auth/login")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send(creds);
      // .end((err) => (err ? done.fail(err) : done()));
    }
  });

  /***************************
   * TESTING ADD_USER
   **************************/
  describe("POST /api/auth/", function () {
    const c = clearConsole();
    const registeredUsers = _.times(2, (n) => ({
      username: `ruser${n}`,
      password: "somepass",
      email: "r.user@mail.com",
      dateofbirth: new Date(),
      firstname: "registered",
      lastname: "user",
    }));
    const validUsers = [
      { username: "user1", password: "password", email: "abc@mail.com" },
      { username: "user2", password: "password", email: "abcd@mail.com" },
      { username: "user3", password: "password", email: "abce@mail.com" },
      { username: "user4", password: "password", email: "abcf@mail.com" },
    ];

    /** @type {import("http").Server} */
    let server;
    /** @type {import("express").Express} */
    let app;

    beforeAll(async function (done) {
      const init = await startApplication();
      app = init.app;
      server = init.server;
      await User.deleteMany()
        .catch(() => null)
        .then(() =>
          Promise.all(registeredUsers.map((user) => User.createUser(user)))
        )
        .catch(c.error)
        .then(() => done());
    });

    afterAll(async function (done) {
      server &&
        server.close(() => {
          server = null;
          done();
        });
    });

    it("should contain all registered users", async function (done) {
      User.find({}, (err, result) => {
        expect(result).toBeDefined();
        done();
      });
    });

    it("should create a new user", async function (done) {
      const payload = validUsers[0];

      request(app)
        .post("/api/auth")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send(JSON.stringify(payload))
        .expect((res) => {
          if (_.has(res.body, ["username", "password"]))
            throw new Error("response does not contain all properties");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("Should fail to create user with missing password", async function (done) {
      const payload = {
        username: `user${Math.random().toFixed(3)}`,
      };
      request(app)
        .post("/api/auth")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send(payload)
        .expect(500)
        .expect((res) => {
          if (res.body.status != ReasonPhrases.INTERNAL_SERVER_ERROR)
            throw new Error("Did not return valid response phrase");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("Should fail to create user with missing username", async function (done) {
      const payload = {
        password: `user${Math.random().toFixed(3)}`,
        email: `user@example.mail`,
      };
      request(app)
        .post("/api/auth")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send(payload)
        .expect(500)
        .expect((res) => {
          if (res.body.status != ReasonPhrases.INTERNAL_SERVER_ERROR)
            throw new Error("Did not return valid response phrase");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("Should be able to register all valid users", async function (done) {
      validUsers.forEach((user) => {
        request(app)
          .post("/api/auth")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .send(user)
          .expect((res, err) => {
            if (
              _.every([
                _.has(res, "body", "username"),
                _.has(res, "body", "email"),
                _.has(res, "body", "_id"),
                !err,
              ])
            )
              return;
            else
              throw new Error("response does not contain all required fields");
          })
          .end((err) => (err ? done.fail(err) : done()));
      });
    });

    it("should fail to create an already registered user", async function (done) {
      request(app)
        .post("/api/auth")
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send(registeredUsers[0])
        .expect((resp) => {
          expect(resp.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(resp.body.status).toEqual(ReasonPhrases.INTERNAL_SERVER_ERROR);
        })
        .end((err) => (err ? done.fail(err) : done()));
    });

    it("should store user passwords in hashed form", async function (done) {
      User.findOne(
        { username: registeredUsers[0].username },
        async (err, user) => {
          expect(user.password).not.toEqual(registeredUsers[0].password);
          expect(
            await bcrypt.compare(registeredUsers[0].password, user.password)
          ).toBeTruthy();
          done();
        }
      );
    });
  });
});
