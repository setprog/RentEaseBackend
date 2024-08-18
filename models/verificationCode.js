const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

module.exports = VerificationCode;
