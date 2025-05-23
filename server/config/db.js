require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const maskedUri = process.env.MONGO_URI.replace(/:[^@]+@/, ":*****@");
    console.log("Connecting to MongoDB with URI:", maskedUri);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
    });

    console.log("MongoDB Connected");
    return mongoose.connection;
  } catch (error) {
    console.error("\nMongoDB Connection Failed:\n");
    console.error("Full Error:", error);
    console.error("\nTroubleshooting Tips:");
    console.error("1. Verify your IP is whitelisted in MongoDB Atlas");
    console.error("2. Check your connection string in .env file");
    console.error("3. Ensure your database user has proper privileges");
    console.error("4. Verify your network connection");
    throw error;
  }
};

module.exports = connectDB;
