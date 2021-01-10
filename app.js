const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const apiRoutes = require("./routes/global.routes");
const { notFound } = require("./utils/route.utils");
const { connectMongo, MongoManager } = require("./db/mongo.db");
const { Server } = require("http");
const cors = require("cors");

// allow angular server
// app.use((req, res, next)=>{
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Header", "*");
//   next();
// });
app.use(
  cors({
    allowedHeaders: "*",
  })
);

app.use((req, res, next) => {
  User.findById("5ff7d5a197df02597d1e880e").then((user) => {
    req.user = user;
    next();
  }).catch(err=>{
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status: ReasonPhrases.INTERNAL_SERVER_ERROR});
  });
});

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

app.use("/api", apiRoutes);
app.use(express.static(path.join(__dirname, "public")));
app.use("", notFound);

// register segfault handler
const SegfaultHandler = require("segfault-handler");
const { User } = require("./models/user.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { connectDB } = require("./db/nosql");
SegfaultHandler.registerHandler("crash.log");

const PORT = 4002;
/** @type {Server} */
let server = null;
Promise.resolve(connectDB())
  .then(() => {
    return app.listen(PORT);
  })
  .then((s) => (server = s))
  .catch(console.error);

process.on("SIGTERM", () => {
  console.log("received SIGTERM, closing gracefully...");
  server && server.close(0);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("received SIGINT, closing gracefully...");
  server && server.close();
  process.exit(0);
});
