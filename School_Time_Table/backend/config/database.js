const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Railway provides MONGODB_URL, not MONGODB_URI
    const mongoURI = process.env.MONGODB_URL || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MongoDB connection string is undefined. Check environment variables."
      );
    }
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
