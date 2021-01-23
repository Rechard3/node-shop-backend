process.env["NODE_ENV"] = "test";

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { startApplication } = require("../../../app");
const {
  addUser,
  authenticate,
  deleteUser,
  readUser,
  updateUser,
} = require("../../../controllers/auth.controller");
const { User } = require("../../../models/user.model");
const _ = require("lodash");
const { response } = require("express");
const { clearConsole } = require("../../helpers/console.helpers");
const { environment } = require("../../../environment");

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
          else throw new Error("response does not contain all required fields");
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
