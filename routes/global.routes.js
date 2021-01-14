const router = require("express").Router();

const productRoutes = require("./product.routes");
const adminRoutes = require("./admin.routes");
const shopRoutes = require("./shop.routes");
const { notFound } = require("../utils/route.utils");
const { userRoutes } = require("./auth.routes");
const { cartRoutes } = require("./cart.routes");
const { orderRoutes } = require("./order.routes");
const { Router } = require("express");

router.use("/product", productRoutes);
router.use("/admin", adminRoutes);
router.use("/shop", shopRoutes);
router.use("/user", userRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/", notFound);

module.exports = router;
