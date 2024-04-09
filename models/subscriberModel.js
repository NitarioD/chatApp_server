const { model, Schema } = require("mongoose");

const SubscriberSchema = new Schema(
  {
    fname: {
      type: String,
      trim: true,
      default: "",
      lowercase: true,
      required: true,
    },
    lname: {
      type: String,
      trim: true,
      default: "",
      lowercase: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: { type: String, default: "" },
    unsubscribe_code: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Subscriber", SubscriberSchema);
