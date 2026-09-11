const dns = require("dns");

// MongoDB Atlas DNS
dns.setServers(["1.1.1.1", "1.0.0.1"]);

require("dotenv").config();

console.log("BREVO USER:", process.env.BREVO_SMTP_USER);
console.log("BREVO PASSWORD EXISTS:", !!process.env.BREVO_SMTP_PASS);
console.log("BREVO FROM EMAIL:", process.env.BREVO_FROM_EMAIL);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();


// =====================================
// CORS
// =====================================

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// Handle preflight requests



// =====================================
// JSON
// =====================================

app.use(express.json());


// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {

    res.json({
        message: "Connect Us Backend is running!"
    });

});


// =====================================
// AUTH ROUTES
// =====================================

app.use("/api/auth", authRoutes);


// =====================================
// JOB ROUTES
// =====================================

app.use("/api/jobs", jobRoutes);


// =====================================
// PORT
// =====================================

const PORT = process.env.PORT || 5000;


// =====================================
// MONGODB
// =====================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log("MongoDB Connected Successfully");

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `Server running on http://localhost:${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.log("MongoDB Connection Failed");
        console.log(error.message);

    });