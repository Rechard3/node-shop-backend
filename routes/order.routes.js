const { createOrder, fetchUserOrders } = require("../controllers/order.controller");

const orderRoutes = require("express").Router();

orderRoutes.post("/confirm", createOrder);
orderRoutes.get("/history", fetchUserOrders);

module.exports = {
    orderRoutes,
}