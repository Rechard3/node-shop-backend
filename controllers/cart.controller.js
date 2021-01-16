const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");
const _ = require("lodash");
const { User } = require("../models/user.model");

/** @type {import("express").RequestHandler} */
async function addProductToCart(req, res, next) {
  const user = await User.findById(req.session.user._id);
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
  User.findById(req.session.user._id)
    .then((user) => Cart.findById(user.cart).select("items"))
    .then((cart) => {
      const { items } = cart.toObject();
      const res = items.map((item) => ({
        ...item.product,
        quantity: item.quantity,
      }));
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

/**
 * removes an amount of product from the user cart
 * @type {import("express").RequestHandler}
 */
function removeProductFromCart(req, res, next) {
  const prodId = req.body["id"];
  const amount = req.body["quantity"];
  Cart.findById(req.user.cart)
    .then((cart) => {
      let newItems = [...cart.toObject().items];
      const prodIdx = newItems.findIndex(
        ({ product }) => product._id.toString() == prodId.toString()
      );
      if (prodIdx >= 0) {
        const tgtItem = newItems[prodIdx];
        tgtItem.quantity = Math.max(0, tgtItem.quantity - amount);
        if (tgtItem.quantity <= 0) {
          newItems = newItems.filter(
            (p) => p.product._id.toString() != prodId.toString()
          );
        }
      }
      cart.items = newItems;
      return cart.save();
    })
    .then((cart) => {
      res
        .status(StatusCodes.OK)
        .send({ status: ReasonPhrases.OK, model: cart });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
}

module.exports = {
  addProductToCart,
  fetchCart,
  removeProductFromCart,
};
