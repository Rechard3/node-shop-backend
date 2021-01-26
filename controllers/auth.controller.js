const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { pick } = require("lodash");
const { Cart } = require("../models/cart.model");
const bcrypt = require("bcrypt");
const { User } = require("../models/user.model");
const _ = require("lodash");

function constructModule() {
  return {
    /** @type {import("express").RequestHandler} */
    async authenticate(req, res, next) {
      const username = req.body["username"];
      const password = req.body["password"];

      const user = await User.findOne({ username }).exec();
      if (!user) {
        // send UNAUTHORIZED instead of NOT_FOUND
        // sending NOT_FOUND can open a "user-enumeration" attack surface
        res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ status: ReasonPhrases.UNAUTHORIZED });
        return [req, res, next];
      }

      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ status: ReasonPhrases.UNAUTHORIZED });
        return [req, res, next];
      }

      req.session.user = user.toObject({ depopulate: true });
      req.session.isAuthenticated = true;
      const returnedFields = _.omit(user.toObject({ depopulate: true }), [
        "password",
      ]);
      res.status(StatusCodes.OK).send({
        status: ReasonPhrases.OK,
        model: returnedFields,
      });
      return [req, res, next];
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

      User.createUser(userData)
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
