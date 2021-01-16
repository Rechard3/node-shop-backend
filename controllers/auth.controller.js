const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { pick, some, isNil } = require("lodash");
const { Cart } = require("../models/cart.model");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");
const { environment } = require("../environment");

function constructModule() {
  return {
    /** @type {import("express").RequestHandler} */
    authenticate(req, res, next) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
      const username = req.body["username"];
      const password = req.body["password"];

      throw new Error("authentication not implemented");
    },

    /** @type {import("express").RequestHandler} */
    addUser(req, res, next) {
      const userData = pick(req.body, [
        "username",
        "password",
        "email",
        "firstname",
        "lastname",
        "dateofbirth",
      ]);
      if (some(userData, isNil)) {
        throw new Error("user data incomplete");
      }
      userData.password = bcrypt.hashSync(
        userData.password,
        environment().hashRounds
      );
      new Cart({ items: [] })
        .save()
        .then((cart) => {
          const user = new User({ ...userData, cart });
          return Promise.all(user.save(), cart);
        })
        .then(([user, cart]) => {
          cart.user = user;
          return cart.save().then((cart) => user);
        })
        .then((user) => {
          res
            .status(StatusCodes.CREATED)
            .send({ status: ReasonPhrases.CREATED, model: user });
        })
        .catch((error) => {
          console.error(error);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
        });
    },

    /** @type {import("express").RequestHandler} */
    readUser(req, res, next) {
      User.findById(req.body._id)
        .then((user) => {
          res
            .status(StatusCodes.OK)
            .send({ status: ReasonPhrases.OK, model: user });
        })
        .catch((err) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: err,
          });
        });
    },

    /** @type {import("express").RequestHandler} */
    updateUser(req, res, next) {
      res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .send({ status: ReasonPhrases.NOT_IMPLEMENTED });
    },

    /** @type {import("express").RequestHandler} */
    deleteUser(req, res, next) {
      res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .send({ status: ReasonPhrases.NOT_IMPLEMENTED });
    },
  };
}

module.exports = constructModule();
