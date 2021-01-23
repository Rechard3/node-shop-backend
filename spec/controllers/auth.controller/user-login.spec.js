process.env["NODE_ENV"] = "test";

const request = require("supertest");
const { startApplication } = require("../../../app");
const { connectDB } = require("../../../db/nosql");
const { User } = require("../../../models/user.model");
const _ = require("lodash");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

describe("POST /api/auth/login", function () {
  /** @type {import("express").Express} */
  let app;
  /** @type {import("https").Server} */
  let server;

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
  });

  beforeAll(async function () {
    await User.deleteMany(); // remove all previously registered users
    return await Promise.all(
      // register dummy data for testing
      registeredUsers.map((user) => new User(user).save())
    );
  });

  afterAll(async function () {
    await User.deleteMany();
    server.close();
  });

  it("Should be able to login with a valid user", async function (done) {
    loginWith(registeredUsers[0], done).expect((res) => {
      if (_.has(res.body, "model.username")) return;
      throw new Error("response did not contain all properties");
    });
  });

  it("should not allow login with unregistered user", async function (done) {
    loginWith(
      { ...registeredUsers[0], username: `${Math.random()}` },
      done
    ).expect((res) => {
      expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
      expect(res.body).not.toContain("model");
    });
  });

  it("should not allow login with invalid credentials [1]", async function (done) {
    loginWith({ ...registeredUsers[0], password: "" }, done).expect((res) => {
      expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
      expect(res.body).not.toContain("model");
    });
    // .end((err) => (err ? done.fail(err) : done()));
  });

  it("should not allow login with invalid credentials [2]", async function (done) {
    loginWith(
      { ...registeredUsers[0], password: `${Math.random()}` },
      done
    ).expect((res) => {
      expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
      expect(res.body).not.toContain("model");
    });
  });

  it("should not allow login with invalid credentials [3]", async function (done) {
    loginWith({
      ...registeredUsers[0],
      password: registeredUsers[0].email,
    }, done).then(resp => {
      expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
      expect(res.body).not.toContain("model");
    });
  });

  function loginWith(creds, done) {
    return request(app)
      .post("/api/auth/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send(creds)
      .end((err) => (err ? done.fail(err) : done()));
  }
});
