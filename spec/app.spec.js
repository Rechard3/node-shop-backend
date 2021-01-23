process.env["NODE_ENV"] = "test";
const {connectDB} = require("../db/nosql");

describe("Express Application", function () {
  /** @type {Server} */
  let server;
  /** @type {import("express").Express} */
  let app;
  const log = console.log;
  console.log = () => null;
  console.info = () => null;
  const {
    createApp,
    startApplication,
    connectMongoDataBase,
    registerApiRoutes,
    startServer,
  } = require("../app");
  const { Server } = require("https");

  beforeEach(async function () {
    let init = await startApplication();
    server = init.server;
    app = init.app;
  });

  afterEach(function () {
    if (server && server.close) {
      server.close(() => (server = null));
    }
  });
  
  it("should just create an express app", function () {
    const app = createApp();
    expect(app).toBeDefined();
  });

  it("should create Express App and start listening", async function () {
    expect(server).toBeInstanceOf(Server);
    expect(server.listening).toBeTrue();
  });

  it("should connect to in-memory database", async function(){
    const mongooseConnection = await connectDB(app);
    expect(mongooseConnection).toBeDefined("Mongoose connection not defined");
    expect(mongooseConnection.connection.host).toMatch(/^(localhost|127\.0\.0\.1)$/, "Mongoose not using memory db")
  });
});
