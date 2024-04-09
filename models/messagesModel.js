const { model, Schema } = require("mongoose");

const MessageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        message: { type: "string" },
        role: { type: "string", required: true, enum: ["user", "binance"] },
        date: { type: "date", required: true, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Message", MessageSchema);
