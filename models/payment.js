const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    payment_id: { type: String, unique: true },
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },
    amount: { type: Number, required: true },
    payment_mathod: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const payment = mongoose.model("payment", paymentSchema);

module.exports = payment;
