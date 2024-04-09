const { model, Schema, ObjectId } = require("mongoose");

const bcrypt = require("bcrypt");
// const { v4: uuidv4 } = require("uuid");

const UserSchema = new Schema(
  {
    user_name: {
      type: String,
      trim: true,
      default: "",
      required: true,
      unique: true,
    },
    case_id: {
      type: "number",
      required: true,
      unique: true,
    },
    hashed_password: { type: String },
  },
  { timestamps: true }
);

//virtual fields
UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
  })
  .get(function () {
    return this._password;
  });

//before saving
UserSchema.pre("save", async function (next) {
  this.hashed_password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods = {
  authenticate: function (plainPassword, hashed_password) {
    return bcrypt.compare(plainPassword, hashed_password);
  },
  encryptPassword: function (plainPassword) {
    try {
      return bcrypt.hash(plainPassword, 10);
    } catch (err) {
      console.log(err);
      return "";
    }
  },
};

module.exports = model("User", UserSchema);
