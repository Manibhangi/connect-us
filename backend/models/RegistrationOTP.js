const mongoose = require("mongoose");

const registrationOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model(
    "RegistrationOTP",
    registrationOTPSchema
);