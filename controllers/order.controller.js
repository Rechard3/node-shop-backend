const { StatusCodes, ReasonPhrases, OK } = require("http-status-codes");
const { Cart } = require("../models/cart.model");
const { Order } = require("../models/order.model");

module.exports = {
  /** @type {import("express").RequestHandler} */
  createOrder(req, res, next) {
    Cart.findById(req.user.cart)
      .then((cart) => {
        const order = new Order({
          items: cart.items,
          timestamp: new Date(),
          user: req.user,
        });
        cart.items = [];
        return Promise.all([cart.save(), order.save()])
      })
      .then(([cart, order]) => {
        res
          .status(StatusCodes.OK)
          .send({ status: ReasonPhrases.OK, model: order });
      })
      .catch((err) => {
        console.error(err);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
      });
  },

  /** @type {import("express").RequestHandler} */
  fetchUserOrders(req, res, next) {
    Order.find({ user: req.user })
      .then((orders) => {
        res.status(StatusCodes.OK).send(orders);
      })
      .catch((err) => {
        console.error(err);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ status: ReasonPhrases.INTERNAL_SERVER_ERROR });
      });
  },
};
