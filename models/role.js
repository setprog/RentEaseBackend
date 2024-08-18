const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roleSchema = new Schema(
  {
    role_id: { type: String, unique: true },
    role_name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const role = mongoose.model("role", roleSchema);

module.exports = role;
