process.env["NODE_ENV"] = "test";

const request = require("supertest");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const _ = require("lodash");

const { startApplication } = require("../../app");
const { clearConsole } = require("../helpers/console.helpers");

const auth = require("../../middleware/auth.middleware");

describe("Products Controller", function () {
  describe("List/Read products", function () {
    /** @type {import("express").Express} */
    let app;
    /** @type {import("https").Server} */
    let server;

    beforeAll(async function () {
      const init = await startApplication();
      app = init.app;
      server = init.server;
    });

    afterAll(function () {
      server.close();
    });

    it("should return a list of all products", async function (done) {
      request(app)
        .get("/api/product")
        .set("Accept", "application/json")
        .expect(StatusCodes.OK)
        .expect((res) => {
          if (res.body && res.body.model && res.body.model instanceof Array)
            return;
          throw new Error("Expected array of products");
        })
        .end((err) => (err ? done.fail(err) : done()));
    });
  });

  describe("Add/Update products", function () {
    /** @type {import("express").Express} */
    let app;
    /** @type {import("https").Server} */
    let server;
    let c = clearConsole();

    beforeAll(async function () {
      const init = await startApplication();
      app = init.app;
      server = init.server;
    });

    afterAll(function () {
      server.close();
    });
  });
});
