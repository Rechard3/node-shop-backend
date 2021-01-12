const { addProductToCart, fetchCart } = require("../controllers/cart.controller");

const router = require("express").Router();

router.post("/add-product", addProductToCart);
router.get("/", fetchCart);

module.exports =  {
    cartRoutes: router,
}