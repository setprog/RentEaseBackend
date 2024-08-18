const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  user_name: { type: String, required: true, unique: true }, // Ensure this field is required
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, required: true }, // Add this field if it is part of your schema
});

// Hash password before saving
userSchema.pre(
  "save",
  async function (next) {
    if (!this.isModified("password")) return next();

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  },
  {
    timestamps: true,
  }
);

// Compare hashed password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
