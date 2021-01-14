const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { User } = require("../models/user.model");

function constructModule() {
  return {
    /** @type {import("express").RequestHandler} */
    authenticate(req, res, next){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status: ReasonPhrases.INTERNAL_SERVER_ERROR});
      throw new Error("authentication not implemented");
    },
    /** @type {import("express").RequestHandler} */
    addUser(req, res, next) {
      const user = new User(req.body);
      user
        .save()
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
