const { Router } = require("express");

const {
  addUser,
  deleteUser,
  readUser,
  updateUser,
  authenticate,
  logout,
} = require("../controllers/auth.controller");
const { hasRole, isAuthenticated } = require("../middleware/auth.middleware");

const router = Router();

router.post("/login", authenticate);
router.post("/", addUser);
router.get("/", isAuthenticated, readUser);
router.put("/", isAuthenticated, updateUser);
router.post("/delete", isAuthenticated, hasRole("admin"), deleteUser);
router.post("/logout", isAuthenticated, logout);

module.exports.authRoutes = router;
