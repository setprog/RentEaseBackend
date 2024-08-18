const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Chapa = require("chapa");
const User = require("./models/user"); // Assuming schemas are in the same directory
const Property = require("./models/property");
const Booking = require("./models/booking");
const Profile = require("./models/profile");
const Account = require("./models/Account");
const Favorite = require("./models/favorite");
const Transaction = require("./models/transaction");
const app = express();
const port = 8000;
const key_api = "CHASECK_TEST-4fF97ZiutAKHS4ZvkTFjKucoHyWlDSSd";
const myChapa = new Chapa(key_api);
// Set up multer for file uploads with unique filenames and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

// Define the multer instance with the storage and fileFilter configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Define valid field names for different types of uploads
    const validProfileFields = ["profile_picture", "id_image"];
    const validPropertyFields = ["image"];

    // Check if the field name is valid and the file type is an image
    if (
      validProfileFields.includes(file.fieldname) ||
      validPropertyFields.includes(file.fieldname)
    ) {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    } else {
      cb(new Error("Invalid field name"), false);
    }
  },
});

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins; adjust as needed
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const uri =
  // "mongodb+srv://nigus2012bh:1621@cluster1.ghzhuq8.mongodb.net/rentingService";
  // "mongodb+srv://nigus2012bh:1621@cluster0.zcjd8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  "mongodb+srv://beamlaktatek:1622@cluster0.zsle8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error connecting to MongoDB", error));

// Define the User schema

// Define the Property model

// Endpoint to add a property
app.post("/addProperty", upload.array("image", 10), async (req, res) => {
  try {
    const {
      property_name,
      description,
      price,
      category,
      status,
      user_id,
      latitude,
      longitude,
      address,
    } = req.body;

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude or longitude value." });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res
        .status(400)
        .json({ message: "Latitude or longitude out of bounds." });
    }

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const image = req.files ? req.files.map((file) => file.filename) : [];

    const newProperty = new Property({
      property_id: uuidv4(),
      property_name,
      image, // Store multiple images
      description,
      price,
      location: { latitude: lat, longitude: lon },
      category,
      status: status === "true",
      user_id,
      address,
    });

    await newProperty.save();
    res
      .status(201)
      .json({ message: "Property saved successfully", property: newProperty });
  } catch (error) {
    console.error("Error registering property:", error);
    res
      .status(500)
      .json({ message: "Failed to add property", error: error.message });
  }
});

// Endpoint to fetch all properties
app.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve properties" });
  }
});
// Backend route to get property details
app.get("/properties/:_id", async (req, res) => {
  const { _id } = req.params; // Destructure _id from req.params
  try {
    console.log("Received request for property _id:", _id); // Log the _id received

    const property = await Property.findOne({ _id });
    if (!property) {
      console.log("Property not found with ID:", _id);
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Failed to retrieve property details" });
  }
});

// Endpoint to get properties by category
app.get("/properties/:category", async (req, res) => {
  const { category } = req.params; // Get category from URL parameters

  try {
    console.log("Received request for category:", category); // Log the category received

    const properties = await Property.find({ category });

    if (properties.length === 0) {
      console.log("No properties found for category:", category);
      return res
        .status(404)
        .json({ message: "No properties found for this category" });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to retrieve properties" });
  }
});
app.get("/api/properties/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("User ID:", userId); // Log the user ID
    const properties = await Property.find({ user_id: userId });
    console.log("Properties:", properties); // Log the fetched properties
    res.json(properties);
  } catch (err) {
    console.error(err); // Log the full error
    res.status(500).json({ message: "Server error" });
  }
});
// Backend route to get user details
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  // Validate if id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Failed to retrieve user details" });
  }
});

app.post(
  "/api/profile",
  upload.fields([{ name: "profile_picture" }, { name: "id_image" }]),
  async (req, res) => {
    try {
      const {
        user_id,
        first_name,
        middle_name,
        last_name,
        phoneNumber,
        address,
        birth_date,
      } = req.body;

      // Retrieve the paths of uploaded files
      const profilePicturePath = req.files["profile_picture"]
        ? req.files["profile_picture"][0].filename
        : null;
      const idImagePath = req.files["id_image"]
        ? req.files["id_image"][0].filename
        : null;

      // Validate required fields
      if (
        !user_id ||
        !first_name ||
        !last_name ||
        !phoneNumber ||
        !address ||
        !birth_date
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

      // Validate date format
      const birthDate = new Date(birth_date);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: "Invalid birth date format." });
      }

      // Check if a profile with the given user_id already exists
      let profile = await Profile.findOne({ user_id });

      if (profile) {
        // Update existing profile
        profile.first_name = first_name;
        profile.middle_name = middle_name;
        profile.last_name = last_name;
        profile.phoneNumber = phoneNumber;
        profile.address = address;
        profile.birth_date = birthDate.toISOString();
        if (profilePicturePath) profile.profile_picture = profilePicturePath;
        if (idImagePath) profile.id_image = idImagePath;

        await profile.save();
        res
          .status(200)
          .json({ message: "Profile updated successfully", profile });
      } else {
        // Create new profile
        const newProfile = new Profile({
          user_id,
          first_name,
          middle_name,
          last_name,
          phoneNumber,
          address,
          birth_date: birthDate.toISOString(),
          profile_picture: profilePicturePath,
          id_image: idImagePath,
        });

        await newProfile.save();
        res.status(201).json({
          message: "Profile created successfully",
          profile: newProfile,
        });
      }
    } catch (error) {
      console.error("Error handling profile:", error);
      res
        .status(500)
        .json({ message: "Failed to handle profile", error: error.message });
    }
  }
);

app.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send("Booking not found");
    res.json(booking);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ approval: "accepted" });

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings with accepted approval found." });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Corrected endpoint to fetch bookings by tenant_id
app.get("/api/bookings/tenant/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ tenant_id: userId });
    if (!bookings) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});

app.patch("/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { approval } = req.body;
    // Update the booking in the database
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { approval },
      { new: true }
    );
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error });
  }
});
app.delete("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking by ID and delete it
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Booking canceled successfully!" });
  } catch (error) {
    console.error("Error canceling the booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { start_date, end_date, total_price } = req.body;

  try {
    // Validate input
    if (!start_date || !end_date || !total_price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find and update the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.start_date = start_date;
    booking.end_date = end_date;
    booking.totalPrice = total_price;
    await booking.save();

    // Optionally, update the property if needed
    const property = await Property.findById(booking.property_id);
    if (property) {
      // Perform any necessary updates to the property if required
      // For example, you might want to recalculate availability
    }

    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/profile/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profiles = await Profile.find({ user_id: userId });
    if (!profiles) {
      return res.status(404).json({ message: "No profiles found" });
    }
    res.json(profiles);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});

//for Editing
app.get("/api/bookings/owner/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ owner_id: userId });
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching bookings" });
  }
});
app.get("/api/account/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    console.error("Error fetching account details", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching account details" });
  }
});
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile details", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching profile details" });
  }
});
// In your backend code

app.post("/api/verify-account-password/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    console.log("userid", userId);
    console.log("password", password);
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const match = await bcrypt.compare(password, account.password);
    if (match) {
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (err) {
    console.error("Password verification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/change-password/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Ensure new password and confirmation match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Find account by userId
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Compare old password with the stored password
    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedNewPassword;
    await account.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing password" });
  }
});
//payment

app.get("/transactions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find transactions where the user is either the sender or the receiver
    const transactions = await Transaction.find({
      $or: [{ from_account: userId }, { to_account: userId }],
    })
      // Populate account details if needed
      .sort({ createdAt: -1 }); // Sort by latest transactions
    if (transactions.length === 0) {
      return res.status(200).json({ message: "No transaction history" });
    }

    res.status(200).json(transactions);
  } catch (err) {
    console.error("Fetch transaction history error:", err);
    res.status(500).json({ error: "Error fetching transaction history" });
  }
});
app.post("/api/transfer", async (req, res) => {
  try {
    const { fromAccountNo, toAccountNo, amount } = req.body;

    // Validate Input
    if (!fromAccountNo || !toAccountNo || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be greater than zero" });
    }

    // Find the Accounts
    const fromAccount = await Account.findOne({ account_no: fromAccountNo });
    const toAccount = await Account.findOne({ account_no: toAccountNo });

    if (!fromAccount || !toAccount) {
      return res
        .status(404)
        .json({ message: "One or both accounts not found" });
    }

    // Check Balance
    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Update Account Balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // Save Updates
    await fromAccount.save();
    await toAccount.save();

    res
      .status(200)
      .json({ message: "Transfer successful", balance: fromAccount.balance });
  } catch (error) {
    console.error("Error during transfer:", error);
    res.status(500).json({ message: "Transfer failed" });
  }
});

app.post("/deposit", async (req, res) => {
  try {
    const tx_ref = uuidv4();
    const { userId, amount } = req.body;
    console.log("Received deposit request:", req.body);

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let account = await Account.findOne({ user_id: userId });

    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user_id: userId });

    if (!user || !profile) {
      return res.status(404).json({ message: "User or Profile not found" });
    }

    const customerInfo = {
      amount: amount.toString(),
      currency: "ETB",
      email: user.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      account_no: account.account_no,
      tx_ref,
      callback_url: "https://www.google.com/callback",
      customization: {
        title: "Deposit",
        description: "Deposit to your account",
      },
    };

    console.log("Customer Info:", customerInfo);

    const chapaResponse = await myChapa.initialize(customerInfo);
    console.log("Chapa Response:", chapaResponse);

    if (chapaResponse.status !== "success") {
      return res.status(500).json({ message: "Failed to initiate deposit" });
    }

    account.balance += parseFloat(amount);
    await account.save();

    res.status(200).json({
      payment_url: chapaResponse.data.checkout_url,
      balance: account.balance,
    });
  } catch (error) {
    console.error("Deposit Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Payment success callback
app.post("/payment/success", async (req, res) => {
  const { tx_ref, status } = req.body;
  if (status === "success") {
    try {
      const transaction = await Transaction.findOne({ tx_ref });
      if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });

      const user = await User.findOne({ user_id: transaction.user_id });
      if (!user) return res.status(404).json({ message: "User not found" });

      user.balance += transaction.amount;
      await user.save();

      transaction.status = "completed";
      await transaction.save();

      res.status(200).json({ message: "Deposit successful" });
    } catch (error) {
      console.error("Payment Success Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(400).json({ message: "Payment failed" });
  }
});
// Withdraw funds
app.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount, paymentGateway } = req.body;
    console.log("Received withdraw request:", req.body);

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found for this user" });
    }

    if (account.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user_id: userId });

    if (!user || !profile) {
      return res.status(404).json({ message: "User or Profile not found" });
    }

    const withdrawResponse = await initiateWithdrawal(
      paymentGateway,
      userId,
      amount,
      user,
      profile,
      account
    );

    if (withdrawResponse.status !== "success") {
      return res.status(500).json({ message: "Failed to initiate withdrawal" });
    }

    account.balance -= amount;
    await account.save();

    res.status(200).json({
      message: "Withdrawal request submitted",
      balance: account.balance,
      payment_url: withdrawResponse.payment_url,
    });
  } catch (error) {
    console.error("Withdrawal Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
const initiateWithdrawal = async (
  paymentGateway,
  userId,
  amount,
  user,
  profile,
  account
) => {
  const tx_ref = uuidv4();

  const customerInfo = {
    amount: amount.toString(),
    currency: "ETB",
    email: user.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    account_no: account.account_no,
    tx_ref,
    callback_url: "https://www.google.com/callback",
    customization: {
      title: "Withdrawal",
      description: "Withdrawal from your account",
    },
  };
  const chapaResponse = await myChapa.initialize(customerInfo);

  if (chapaResponse.status === "success") {
    return { status: "success", payment_url: chapaResponse.data.checkout_url };
  } else {
    return { status: "failure" };
  }
};

// Get balance
app.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the account for the user
    const account = await Account.findOne({ user_id: userId });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found for this user" });
    }

    res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// using Tenant_id
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
//favorite
app.post("/favorites", async (req, res) => {
  try {
    const { property_id, user_id } = req.body;

    // Check if the favorite record already exists
    let favorite = await Favorite.findOne({ property_id, user_id });

    if (favorite) {
      // Update the existing favorite record to set liked to true
      favorite.liked = true;
      await favorite.save();
    } else {
      // Create a new favorite record with liked set to true
      favorite = new Favorite({ property_id, user_id, liked: true });
      await favorite.save();
    }

    res.status(200).json(favorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/favorites/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find all favorite records for the user
    const favorites = await Favorite.find({ user_id, liked: true });

    // Extract property details from favorites
    const favoriteProperties = await Promise.all(
      favorites.map(async (favorite) => {
        const property = await Property.findById(favorite.property_id);
        return {
          ...property.toObject(),
          liked: favorite.liked,
          favoriteId: favorite._id,
        }; // Include favoriteId
      })
    );

    res.status(200).json(favoriteProperties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/favorites/:userId/:propertyId", async (req, res) => {
  try {
    const { userId, propertyId } = req.params;

    // Find the favorite entry for the given user and property
    const favorite = await Favorite.findOne({
      user_id: userId,
      property_id: propertyId,
    });

    if (favorite) {
      return res.status(200).json({ liked: favorite.liked });
    } else {
      return res.status(404).json({ message: "Favorite not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.delete("/favorites/:userId/:propertyId", async (req, res) => {
  try {
    const { userId, propertyId } = req.params;

    // Delete the favorite entry
    const result = await Favorite.deleteOne({
      user_id: userId,
      property_id: propertyId,
    });

    if (result.deletedCount > 0) {
      return res
        .status(200)
        .json({ status: "success", message: "Favorite removed successfully." });
    } else {
      return res.status(404).json({ message: "Favorite not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
app.delete("/favorites/:favoriteId", async (req, res) => {
  const { favoriteId } = req.params;

  try {
    // Find the favorite and update the liked status to false
    const favorite = await Favorite.findById(favoriteId);
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    // Update the liked status to false
    favorite.liked = false;
    await favorite.save();

    // Delete the favorite entry
    await Favorite.findByIdAndDelete(favoriteId);

    res
      .status(200)
      .json({ message: "Favorite removed and status updated to false" });
  } catch (error) {
    console.error("Error updating and deleting favorite:", error);
    res.status(500).json({ message: "Failed to update and delete favorite" });
  }
});
// Sign-Up Endpoint
app.post("/signUp", async (req, res) => {
  try {
    const { user_name, email, password, role } = req.body;
    if (!role || !user_name) {
      return res
        .status(400)
        .json({ message: "Role and User Name are required" });
    }

    // Check for existing user by username or email
    const existingUser = await User.findOne({
      $or: [{ user_name }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ user_name, email, password, role });
    await newUser.save();

    // Generate unique account number and create account
    const accountNo = await generateUniqueAccountNo();
    const newAccount = new Account({
      account_no: accountNo,
      user_id: newUser._id,
      balance: 0,
      password: "changeme",
    });
    await newAccount.save();

    res
      .status(201)
      .json({ message: "User registered successfully and account created" });
  } catch (error) {
    console.error("Error registering user", error);
    res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
});

// Sign-In Endpoint
// /signIn endpoint
// /signIn endpoint
app.post("/signIn", async (req, res) => {
  try {
    const { user_name, email, password } = req.body;

    // Find the user by username or email
    const user = await User.findOne({ $or: [{ user_name }, { email }] });

    // Check if the user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    // Compare the provided password with the stored password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id.toString() }, // Ensure _id is a string
      "4dC1aYbZ9eKxR3uWvA8hP7tQwJ2nL5sFzM0oO1rT6pVbGxN", // Your JWT secret
      { expiresIn: "1h" }
    );

    // Respond with success message and user data including role
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id.toString(), // Ensure _id is a string
        role: user.role, // Include the role field
      },
    });
  } catch (error) {
    console.error("Error during sign-in", error);
    res.status(500).json({ message: "An unexpected error occurred", error });
  }
});
// Endpoint to add a booking
app.post("/addBooking", async (req, res) => {
  try {
    const {
      property_id,
      tenant_id,
      owner_id,
      start_date,
      end_date,
      message,
      total_price,
    } = req.body;

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    const newBooking = new Booking({
      property_id,
      tenant_id,
      owner_id,
      start_date: startDate,
      end_date: endDate,
      message,
      totalPrice: total_price, // Match the key with frontend
    });

    await newBooking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Failed to create booking", error: error.message });
  }
});

//Notification End point
app.get("/notifications", async (req, res) => {
  try {
    const notifications = await Booking.find({ approval: "Pending" });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to retrieve notifications" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
