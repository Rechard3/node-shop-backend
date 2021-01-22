process.env["NODE_ENV"] = "test";

const { StatusCodes } = require("http-status-codes");
const request = require("supertest");
const { startApplication } = require("../../app");
const {
  addUser,
  authenticate,
  deleteUser,
  readUser,
  updateUser,
} = require("../../controllers/auth.controller");
const { User } = require("../../models/user.model");
const _ = require("lodash");

/***************************
 * TESTING ADD_USER
 **************************/
describe("POST /api/auth/", function () {
  /** @type {import("http").Server} */
  let server;
  /** @type {import("express").Express} */
  let app;
  let log;
  beforeAll(async function (done) {
    log = console.log;
    console.log = () => null;
    const init = await startApplication();
    app = init.app;
    server = init.server;
    done();
  });
  afterAll(async function (done) {
    server &&
      server.close(() => {
        server = null;
        done();
      });
  });

  it("should create a new user", async function (done) {
    const payload = {
      username: `testuser${Math.random().toFixed(3)}`,
      password: `testpassword${Math.random()}`,
      email: "test@exmaple.com",
    };

    request(app)
      .post("/api/auth")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send(JSON.stringify(payload))
      .expect((res) => {
        log(res.body);
        return _.has(res.body, ["username", "password"]);
      }).end(err => done(err));
  });
});
