const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Ensure uuidv4 is imported

const Schema = mongoose.Schema;

const FavoriteSchema = new Schema(
  {
    property_id: {
      type: Schema.Types.ObjectId,
      ref: "property",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    liked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Favorite = mongoose.model("Favorite", FavoriteSchema);

module.exports = Favorite;
