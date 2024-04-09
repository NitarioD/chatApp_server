const express = require("express");

const router = express.Router();

const { signup, login, signout } = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", signout);

module.exports = router;
