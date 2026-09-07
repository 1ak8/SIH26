const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
    console.log("Network might be blocking the connection. Attempting to fallback to Local MongoDB...");
    
    try {
      const localUri = 'mongodb://127.0.0.1:27017/aarogyanet';
      const localConn = await mongoose.connect(localUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`Fallback Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localError) {
      console.error(`Local MongoDB Connection Error: ${localError.message}`);
      console.error('Make sure MongoDB is installed and running locally.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
