const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        service: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        budget: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["available", "accepted", "completed"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Job", jobSchema);