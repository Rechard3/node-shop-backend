const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { Product } = require("../models/product.model");
const _ = require("lodash");

/** @type {import("express").RequestHandler} */
module.exports.getProduct = (req, res, next) => {
  Product.fetchById(req.params["id"]).then((product) => {
    res.status(200).send({status: StatusCodes.OK, model: product});
  });
};

/** @type {import("express").RequestHandler} */
module.exports.deleteProduct = (req, res, next) => {
  Product.findOneAndRemove(req.body._id)
    .then((product) => {
      return product.delete();
    })
    .then((_) => {
      res.status(StatusCodes.OK).send({ status: ReasonPhrases.OK });
    })
    .catch((error) => {
      console.error(error);
    });
};

/** @type {import("express").RequestHandler} */
module.exports.listProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.status(200).send({status: StatusCodes.OK, model: products});
    })
    .catch((err) => {
      res.status(500).send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
      throw err;
    });
};

/** @type {import("express").RequestHandler} */
module.exports.addProduct = (req, res, next) => {
  /** @type {Product} */ const tmp = req.body;
  const { name, price, imageUrl, description } = tmp;
  const prod = new Product({ ...req.body });
  prod
    .save()
    .then((prod) => {
      res.status(200).send({status: StatusCodes.OK, model: prod});
    })
    .catch((err) => {
      console.error("an error occured: ");
      res.status(500).send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
      throw err;
    });
};

/** @type {import("express").RequestHandler} */
module.exports.editProduct = (req, res, next) => {
  // const product = new Product(req.body);
  /** @type {Product} */ const tmp = req.body;
  const { name, price, imageUrl, description } = tmp;
  /** @type {Document<ProductModel>}*/ const prod = Product.findById(
    req.body._id
  )
    .then((prod) => {
      const modProd = _.pick(req.body, ["name", "description", "imageUrl", "price"]);
      _.assign(prod, modProd);
      prod.save();
      console.log(prod);
      res.status(StatusCodes.OK).send({ status: ReasonPhrases.OK, model: prod });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
};
