const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    review_id: { type: String, unique: true },
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
    user_id: { type: Schema.Types.ObjectId, ref: "user", required: true },
    rating: { type: String, required: true },
    comment: { type: String },
  },
  {
    timestamps: true,
  }
);

const review = mongoose.model("review", reviewSchema);

module.exports = review;
