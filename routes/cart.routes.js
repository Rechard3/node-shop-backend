const {
  addProductToCart,
  fetchCart,
  removeProductFromCart,
} = require("../controllers/cart.controller");

const router = require("express").Router();

router.post("/add-product", addProductToCart);
router.post("/remove-product", removeProductFromCart);
router.get("/", fetchCart);

module.exports.cartRoutes = router;
