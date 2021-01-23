const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { pick, some, isNil } = require("lodash");
const { Cart } = require("../models/cart.model");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");
const { environment } = require("../environment");
const _ = require("lodash");

function constructModule() {
  return {
    /** @type {import("express").RequestHandler} */
    authenticate(req, res, next) {
      const username = req.body["username"];
      const password = req.body["password"];
      return User.findOne({ username })
        .then(
          (user) =>
            new Promise((resolve, reject) =>
              bcrypt.compare(password, user && user.password, (err, result) => {
                if (result) resolve(user);
                else reject("passwords do not match");
              })
            )
        )
        .then((user) => {
          req.session.user = user.toObject({ depopulate: true });
          req.session.isAuthenticated = true;
          return user;
        })
        .then(
          (user) => {
            res.status(StatusCodes.OK).send({
              status: ReasonPhrases.OK,
              model: _.pick(user, ["username", "email"]),
            });
          },
          (reason) => {
            res
              .status(StatusCodes.UNAUTHORIZED)
              .send({ status: ReasonPhrases.UNAUTHORIZED });
          }
        )
        .catch({});
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

      const user = new User(userData);
      const validation = user
        .validate()
        .catch((reason) => {
          // res.status(500).send({ status: reason });
          console.error(reason);
          throw reason;
        })
        .then(() => bcrypt.hash(userData.password, environment().hashRounds))
        .then((pass) => {
          user.password = pass;
          return user.save();
        })
        .then((user) => {
          return new Cart({ items: [], user }).save().then((cart) => user);
        })
        .then((user) => {
          res.status(StatusCodes.CREATED).send({
            status: ReasonPhrases.CREATED,
            model: _.omit(user.toObject({ depopulate: true }), [
              "password",
              "cart",
            ]),
          });
        })
        .catch((error) => {
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

    /** @type {import("express").RequestHandler} */
    logout(req, res, next) {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
          return;
        }
        res.status(StatusCodes.OK).send({ status: ReasonPhrases.OK });
      });
    },
  };
}

module.exports = constructModule();
