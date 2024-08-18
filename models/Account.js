const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    account_no: { type: String, unique: true },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    balance: { type: Number, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

AccountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const generateUniqueAccountNo = async () => {
  let accountNo;
  let isUnique = false;

  while (!isUnique) {
    accountNo = (
      Math.floor(Math.random() * 9000000000) + 1000000000
    ).toString();
    const existing = await Account.findOne({ account_no: accountNo });

    if (!existing) {
      isUnique = true;
    }
  }

  return accountNo;
};

AccountSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("account_no")) {
    this.account_no = await generateUniqueAccountNo();
  }
  next();
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
