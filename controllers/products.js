const { Product } = require("../models/product.model");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

/** @type {import("express").RequestHandler} */
module.exports.getProduct = (req, res, next) => {
  Product.fetchById(req.params["id"]).then((product) => {
    res.status(200).send(product);
  });
};

/** @type {import("express").RequestHandler} */
module.exports.deleteProduct = (req, res, next) => {
  Product.fetchById(req.body._id)
    .then((product) => {
      return product.delete()
    })
    .then((_) => {
      res.status(StatusCodes.OK).send({status: ReasonPhrases.OK});
    })
    .catch((error) => {
      console.error(error);
    });
};

/** @type {import("express").RequestHandler} */
module.exports.listProducts = (req, res, next) => {
  Product.list()
    .then((products) => {
      res.status(200).send(products);
    })
    .catch((err) => {
      res.status(500).send({status: ReasonPhrases.INTERNAL_SERVER_ERROR});
      throw err;
    });
};

/** @type {import("express").RequestHandler} */
module.exports.addProduct = (req, res, next) => {
  /** @type {Product} */ const tmp = req.body;
  const { name, price, imageUrl, description } = tmp;
  const prod = new Product(tmp, req['user']);
  prod
    .save()
    .then((prod) => {
      res.status(200).send(prod);
    })
    .catch((err) => {
      console.error("an error occured: ");
      res.status(500).send({status: ReasonPhrases.INTERNAL_SERVER_ERROR});
      throw err;
    });
};

/** @type {import("express").RequestHandler} */
module.exports.editProduct = (req, res, next)=>{
  const product = new Product(req.body);
  console.log(product);
  product.save();
  res.status(StatusCodes.OK).send({status: ReasonPhrases.OK});
}