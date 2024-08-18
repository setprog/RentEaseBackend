const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const booking_requestSchema = new Schema(
  {
    
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    owner_id: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const booking_request = mongoose.model("booking", booking_requestSchema);

module.exports = booking_request;
