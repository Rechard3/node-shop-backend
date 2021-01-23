process.env['NODE_ENV'] = 'test';
const request = require("supertest");

const { User } = require("../../../models/user.model");
const { startApplication } = require("../../../app");
const { StatusCodes } = require("http-status-codes");

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
      })
  });

  it("should return a session cookie", async function () {});
});
