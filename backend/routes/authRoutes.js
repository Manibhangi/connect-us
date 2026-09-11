const express = require("express");

const {
    sendRegistrationOTP,
    verifyRegistrationOTP,
    loginUser,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const router = express.Router();

router.post("/register/send-otp", sendRegistrationOTP);
router.post("/register/verify-otp", verifyRegistrationOTP);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;