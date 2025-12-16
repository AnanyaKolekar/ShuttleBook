const mongoose = require("mongoose");

const connectDB = async () => {
  try {
   
    const uri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/badminton";

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
