const router = require("express").Router();
const {getProduct, listProducts, addProduct, deleteProduct, editProduct} = require("../controllers/products");


router.get("/:id", getProduct);
router.get("/", listProducts);
router.post("/add", addProduct);
router.post("/edit", editProduct);
router.post("/delete", deleteProduct)

module.exports = router;