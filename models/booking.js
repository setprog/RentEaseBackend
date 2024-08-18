const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    approval: { type: String, default: "Pending" },
    message: { type: String },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
