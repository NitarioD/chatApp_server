const express = require("express");
const router = express.Router();

const { requireSignin } = require("../controllers/auth");
const {
  message,
  binanceMessage,
  messages,
  binanceMessages,
  deleteMessage,
} = require("../controllers/messages");

router.post("/chat", requireSignin, message);
router.post("/chat/binance", requireSignin, binanceMessage);
router.get("/chat", requireSignin, messages);
router.get("/chat/:case_id", requireSignin, binanceMessages);
router.delete("/chat/delete/:message_id", requireSignin, deleteMessage);

module.exports = router;
