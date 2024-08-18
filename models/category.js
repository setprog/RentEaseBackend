const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    category_id: { type: String, unique: true },
    category_name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const category = mongoose.model("category", categorySchema);

module.exports = category;
