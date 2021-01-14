const { Router } = require("express");

const {
  addUser,
  deleteUser,
  readUser,
  updateUser,
  authenticate,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/login", authenticate);
router.post("/", addUser);
router.get("/", readUser);
router.put("/", updateUser);
router.post("/delete", deleteUser);

module.exports.userRoutes = router;
