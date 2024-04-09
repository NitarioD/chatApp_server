const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const User = require("../models/userModel");

exports.signup = async (req, res) => {
  if (!req.body.password) {
    res.json({ error: "password cannot be empty" });
    return;
  }
  if (req.body.password.length <= 6) {
    res.json({ error: "password must be longer than 6 characters" });
    return;
  }
  try {
    const exist = await User.findOne({ user_name: req.body.user_name });
    if (exist) {
      return res.json({
        error: "user with this username already exists, login instead",
      });
    }
    const user = new User(req.body);
    const userDetails = await user.save();
    userDetails.hashed_password = undefined;
    res.json(userDetails);
  } catch (err) {
    console.log(err);
  }
};
exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ ok: true });
};

exports.login = async (req, res) => {
  const { user_name, password } = req.body;
  const user = await User.findOne({ user_name });
  if (!user)
    return res.json({
      error: "User with this username does not exist, please signup!",
    });
  const isUser = await user.authenticate(password, user.hashed_password);
  if (!isUser) return res.json({ error: "password is incorrect" });

  //generate a signed token using the user id and secret
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  //persist the token as t in cookie with expiry
  res.cookie("t", token, { expire: new Date() + 999 });
  //return user details and token to client
  const { _id } = user;
  //get case_id
  const case_id = await User.findById(_id).select("case_id");
  res.json({ token, user: { _id }, case_id: case_id });
};

exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
