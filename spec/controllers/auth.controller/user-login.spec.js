process.env["NODE_ENV"] = "test";

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const _ = require("lodash");
const request = require("supertest");

const { startApplication } = require("../../../app");
const { User } = require("../../../models/user.model");
const {environment} = require("../../../environment");
const {clearConsole} = require("../../helpers/console.helpers");


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
  });

  beforeAll(async function () {
    return await Promise.all(
      registeredUsers.map(user => User.createUser(user))
    ).catch();
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
    loginWith(registeredUsers[0], done).expect((res) => {
      if (_.has(res.body, "model.username")) return;
      throw new Error("response did not contain all properties");
    })
    .end((err) => (err ? done.fail(err) : done()));

  });

  it("should not allow login with unregistered user", async function (done) {
    loginWith(
      { ...registeredUsers[0], username: `${Math.random()}` },
      done
    ).expect((res) => {
      expect(res.status).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toEqual(ReasonPhrases.UNAUTHORIZED);
      expect(res.body).not.toContain("model");
    })
    .end((err) => (err ? done.fail(err) : done()));

  });

  it("should not allow login with invalid credentials [1]", async function (done) {
    loginWith({ ...registeredUsers[0], password: "" }, done).expect((res) => {
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
        password: registeredUsers[0].email,
      },
      done
    );
      loginReq.expect((resp) => {
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
      .send(creds)
      // .end((err) => (err ? done.fail(err) : done()));
  }
});
