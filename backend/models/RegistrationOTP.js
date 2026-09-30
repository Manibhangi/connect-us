const mongoose = require("mongoose");

const registrationOtpSchema =
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
                index: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            password: {
                type: String,
                required: true
            },

            role: {
                type: String,
                enum: [
                    "customer",
                    "worker"
                ],
                required: true
            },

            termsAccepted: {
                type: Boolean,
                required: true,
                default: false
            },

            otpHash: {
                type: String,
                required: true
            },

            otpExpires: {
                type: Date,
                required: true
            },

            otpAttempts: {
                type: Number,
                default: 0,
                min: 0
            },

            verified: {
                type: Boolean,
                default: false
            }
        },

        {
            timestamps: true
        }
    );


// Automatically remove expired OTP records.

registrationOtpSchema.index(
    {
        otpExpires: 1
    },
    {
        expireAfterSeconds: 0
    }
);


module.exports =
    mongoose.model(
        "RegistrationOTP",
        registrationOtpSchema
    );