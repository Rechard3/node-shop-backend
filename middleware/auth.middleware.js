const { ReasonPhrases, StatusCodes } = require("http-status-codes");

function constructModule() {
  return {
    /** @type {import("express").RequestHandler} */
    isAuthenticated(req, res, next) {
      if (!req.session.isAuthenticated) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ status: ReasonPhrases.UNAUTHORIZED });
        return;
      }
      next();
    },
    /** @type {(role: string)=>import("express").RequestHandler} */
    hasRole: (role) =>
      function (req, res, next) {
        const effectiveRoles = req.session.roles || [];
        if (!effectiveRoles.find((r) => r == role)) {
          res
            .status(StatusCodes.UNAUTHORIZED)
            .send({ status: ReasonPhrases.UNAUTHORIZED });
            return ;
        }
        next();
      },
    /** @type {import("express").RequestHandler} */
    checkAuthenticity(req, res, next) {
      if (req.session.user && !req.session.isAuthenticated) {
        req.session.isAuthenticated = true;
        req.session.save().then(() => {
          next();
        });
      }
      next();
    },
  };
}

module.exports = constructModule();
