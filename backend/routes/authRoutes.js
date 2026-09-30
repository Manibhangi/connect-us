const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    verifyRegistrationOtp,
    resendRegistrationOtp
} = require("../controllers/authController");


// =========================
// REGISTER
// =========================

router.post(
    "/register",
    registerUser
);


// =========================
// VERIFY REGISTRATION OTP
// =========================

router.post(
    "/verify-registration-otp",
    verifyRegistrationOtp
);


// =========================
// RESEND REGISTRATION OTP
// =========================

router.post(
    "/resend-registration-otp",
    resendRegistrationOtp
);


// =========================
// LOGIN
// =========================

router.post(
    "/login",
    loginUser
);


// =========================
// FORGOT PASSWORD
// =========================

router.post(
    "/forgot-password",
    forgotPassword
);


// =========================
// VERIFY PASSWORD OTP
// =========================

router.post(
    "/verify-otp",
    verifyOtp
);


// =========================
// RESET PASSWORD
// =========================

router.post(
    "/reset-password",
    resetPassword
);


module.exports = router;