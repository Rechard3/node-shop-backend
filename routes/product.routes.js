const { isAuthenticated, hasRole } = require("../middleware/auth.middleware");

const router = require("express").Router();
const {
  getProduct,
  listProducts,
  addProduct,
  deleteProduct,
  editProduct,
} = require("../controllers/products");

router.get("/:id", isAuthenticated, getProduct);
router.get("/", listProducts);
router.post("/add", isAuthenticated, hasRole("admin"), addProduct);
router.post("/edit", isAuthenticated, hasRole("admin"), editProduct);
router.post("/delete", isAuthenticated, hasRole("admin"), deleteProduct);

module.exports.productRoutes = router;
