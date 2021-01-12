const SegfaultHandler = require("segfault-handler");
const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("http");
const cors = require("cors");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const crypto = require("crypto");
const path = require("path");

const { connectDB } = require("./db/nosql");
const { environment } = require("./environment");
const apiRoutes = require("./routes/global.routes");
const { notFound } = require("./utils/route.utils");
const { User } = require("./models/user.model");
const { Cart } = require("./models/cart.model");

const app = express();

app.use(
  cors({
    allowedHeaders: "*",
  })
);

app.use((req, res, next) => {
  User.find({
    $or: [{ username: "Admin" }, { username: environment.mongoUser }],
  })
    .then(([user]) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
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
SegfaultHandler.registerHandler("crash.log");

const PORT = 4002;
/** @type {Server} */
let server = null;
Promise.resolve(connectDB())
  .then(async () => {
    // check if admin exists
    if ((await User.countDocuments()) < 1) {
      console.warn("no default user exists in the db. Creating default user");
      /** @type {UserModel} */ const adminUser = {
        username: environment.mongoUser,
        password: crypto
          .createHash("sha256")
          .update(environment.mongoPass)
          .digest("base64"),
        dateofbirth: new Date(),
        email: "omarabusaada93@gmail.com",
        firstName: "omar",
        lastName: "abu saada",
      };
      return new User(adminUser).save();
    } else return User.findOne().populate("cart");
  })
  .then((user) => {
    if (!user.cart) {
      /** @type {CartModel} */
      const cartData = {
        items: [],
        user,
      };
      console.warn("main user has no cart, creating default cart: ", cartData);
      return Promise.all([new Cart(cartData).save(), user]);
    } else {
      return [user.cart, user];
    }
  })
  .then(([cart, user]) => {
    user.cart = cart;
    return user.save();
  })
  .then(() => {
    return app.listen(PORT);
  })

  .then((s) => (server = s))
  .then(() => {
    console.info(
      "*".repeat(100),
      "\n",
      "app is listening on ",
      PORT,
      "\n",
      "*".repeat(100)
    );
  })
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
