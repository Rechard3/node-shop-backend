const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");
const _ = require("lodash");

/** @type {import("express").RequestHandler} */
async function addProductToCart(req, res, next) {
  const user = req.user;
  const product = await Product.findById(req.body["id"]);
  const cart = await Cart.findById(user.cart);
  cart
    .addToCart(product)
    .save()
    .then((cart) => {
      res.status(StatusCodes.OK).send({
        status: ReasonPhrases.OK,
        model: {
          cart,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
}

/** @type {import("express").RequestHandler} */
function fetchCart(req, res, next) {
  Cart.findById(req.user.cart)
    .select("items")
    .then((cart) => {
      const {items} = cart.toObject();
      
      const res = items.map(item => ({...item.product, quantity: item.quantity}));
      return res;
    })
    .then((items) => {
      res.status(StatusCodes.OK).send(items);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
}

module.exports = {
  addProductToCart,
  fetchCart,
};
