const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const profileSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    first_name: { type: String, required: true },
    middle_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    profile_picture: { type: String },
    id_image: { type: String },
    birth_date: { type: String },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
