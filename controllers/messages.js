const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const Message = require("../models/messagesModel");
const User = require("../models/userModel");

exports.message = async (req, res) => {
  const userID = req.auth._id;
  if (!req.body.message) {
    res.json({ error: "message cannot be empty" });
    return;
  }

  try {
    //role of the message sender
    const role = "user";
    const message = { message: req.body.message, role };

    const messageHistory = await Message.findOne({ user: userID });

    if (messageHistory) {
      messageHistory.messages.push(message);
      messageHistory.save();

      return res.json({
        message: messageHistory.messages[messageHistory.messages.length - 1],
      });
    } else {
      const newMessage = await Message({ user: userID, messages: [message] });
      newMessage.save();

      return res.json({
        message: newMessage.messages[newMessage.messages.length - 1],
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.binanceMessage = async (req, res) => {
  const caseID = req.body.case_id;
  if (!req.body.message) {
    res.json({ error: "message cannot be empty" });
    return;
  }

  try {
    //role of the message sender
    const role = "binance";

    //get user id for the case
    const userID = await User.findOne({ case_id: caseID }).select("id");

    const message = { message: req.body.message, role };

    const messageHistory = await Message.findOne({ user: userID._id });

    if (messageHistory) {
      messageHistory.messages.push(message);
      messageHistory.save();

      return res.json({
        message: messageHistory.messages[messageHistory.messages.length - 1],
      });
    } else {
      const newMessage = await Message({ user: userID, messages: [message] });
      newMessage.save();

      return res.json({
        message: newMessage.messages[newMessage.messages.length - 1],
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.messages = async (req, res) => {
  const userID = req.auth._id;

  try {
    const exist = await Message.findOne({ user: userID });

    if (exist) {
      const { messages } = await Message.findOne({ user: userID }).sort(
        "created_at DESC"
      );
      return res.json({ messages });
    } else {
      return res.json({ messages: [] });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.binanceMessages = async (req, res) => {
  const caseID = req.params.case_id;

  try {
    //get user id for the case
    const userID = await User.findOne({ case_id: caseID }).select("id");

    const exist = await Message.findOne({ user: userID });

    if (exist) {
      const { messages } = await Message.findOne({ user: userID }).sort(
        "created_at DESC"
      );
      return res.json({ messages });
    } else {
      return res.json({ messages: [] });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.deleteMessage = async (req, res) => {
  const messageID = req.params.message_id;

  try {
    const message = await Message.findOneAndUpdate(
      {
        "messages._id": messageID,
      },
      { $pull: { messages: { _id: messageID } } }
    );

    return res.json({ deleted: messageID });
  } catch (err) {
    console.log(err);
  }
};
