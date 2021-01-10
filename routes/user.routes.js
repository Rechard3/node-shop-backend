const { Router } = require("express");
const { addUser, readUser, updateUser, deleteUser } = require("../controllers/user.controller");


const router = Router();

router.post("/", addUser);
router.get("/", readUser);
router.put("/", updateUser);
router.post("/delete", deleteUser);


module.exports.userRoutes = router;