const router = require("express").Router();

const productRoutes = require("./product.routes");
const adminRoutes = require("./admin.routes");
const shopRoutes = require("./shop.routes");
const { notFound } = require("../utils/route.utils");
const { authRoutes } = require("./auth.routes");
const { cartRoutes } = require("./cart.routes");
const { orderRoutes } = require("./order.routes");
const { isAuthenticated, hasRole } = require("../middleware/auth.middleware");

router.use("/product", productRoutes);
router.use("/admin", isAuthenticated, hasRole("admin"), adminRoutes);
router.use("/shop", shopRoutes);
router.use("/cart", isAuthenticated, cartRoutes);
router.use("/order", isAuthenticated, orderRoutes);
router.use("/auth", authRoutes);
router.use("/", notFound);

module.exports = router;
