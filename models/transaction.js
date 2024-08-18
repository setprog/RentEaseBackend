const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  from_account: {
    type: Schema.Types.ObjectId,
    ref: "account",
    required: true,
  },
  to_account: {
    type: Schema.Types.ObjectId,
    ref: "account",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  gatway:{
    type:String,
  },

  tx_ref: {
    type: String,
    required: true,
    unique: true,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
