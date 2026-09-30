const mongoose = require("mongoose");
const dns = require("dns");

// Fix MongoDB Atlas SRV DNS resolution
dns.setServers([
    "1.1.1.1",
    "1.0.0.1"
]);

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );

    } catch (error) {
        console.error("MongoDB Connection Error:");
        console.error(error.message);

        process.exit(1);
    }
};

module.exports = connectDB;