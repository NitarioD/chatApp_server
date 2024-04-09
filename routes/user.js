const express = require("express");
const router = express.Router();

const { requireSignin } = require("../controllers/auth");
const { userById, user, users } = require("../controllers/user");

router.param("userId", userById);
router.get("/user", requireSignin, user);
router.get("/users", requireSignin, users);

module.exports = router;
