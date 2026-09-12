const User = require("../models/user");
const PasswordReset = require("../models/PasswordReset");
const RegistrationOTP = require("../models/RegistrationOTP");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ==========================================
// EMAIL CONFIGURATION - BREVO
// ==========================================

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    }
});


// ==========================================
// SEND REGISTRATION OTP
// ==========================================

const sendRegistrationOTP = async (req, res) => {
    try {

        const {
            name,
            phone,
            email,
            location,
            role,
            password
        } = req.body;


        // Check all fields
        if (
            !name ||
            !phone ||
            !email ||
            !location ||
            !role ||
            !password
        ) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }


        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });
        }


        // Email format validation
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message:
                    "Please enter a valid email address"
            });
        }


        const cleanEmail =
            email.toLowerCase().trim();


        // Check existing user
        const existingUser =
            await User.findOne({
                $or: [
                    {
                        email: cleanEmail
                    },
                    {
                        phone: phone.trim()
                    }
                ]
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email or phone already registered"
            });

        }


        // Generate 6 digit OTP
        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        // OTP valid for 10 minutes
        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        // Hash password before temporary storage
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Remove old registration OTP
        await RegistrationOTP.deleteMany({
            email: cleanEmail
        });


        // Save registration information
        await RegistrationOTP.create({

            email: cleanEmail,

            otp: otp,

            name: name.trim(),

            phone: phone.trim(),

            location: location.trim(),

            role: role,

            password: hashedPassword,

            expiresAt: expiresAt

        });


        // Send OTP email
        await transporter.sendMail({

            from: process.env.BREVO_FROM_EMAIL,

            to: cleanEmail,

            subject:
                "Connect Us - Email Verification OTP",

            text:
`Hello ${name},

Welcome to Connect Us!

Your email verification OTP is:

${otp}

This OTP is valid for 10 minutes.

Please enter this OTP on the Connect Us registration page to complete your account creation.

If you did not create a Connect Us account, please ignore this email.

Connect Us
For the People, By the People`

        });


        res.status(200).json({

            message:
                "OTP sent successfully. Please check your email."

        });

    }

    catch (error) {

        console.error(
            "REGISTRATION OTP ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to send verification OTP"

        });

    }
};



// ==========================================
// VERIFY REGISTRATION OTP
// CREATE ACCOUNT ONLY AFTER VERIFICATION
// ==========================================

const verifyRegistrationOTP = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({

                message:
                    "Email and OTP are required"

            });

        }


        const cleanEmail =
            email.toLowerCase().trim();


        // Find OTP
        const registration =
            await RegistrationOTP.findOne({

                email: cleanEmail,

                otp: otp.trim()

            });


        if (!registration) {

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }


        // Check expiration
        if (
            new Date() >
            registration.expiresAt
        ) {

            await RegistrationOTP.deleteOne({
                _id: registration._id
            });

            return res.status(400).json({

                message:
                    "OTP has expired. Please request a new OTP."

            });

        }


        // Check again if account was created
        const existingUser =
            await User.findOne({

                $or: [
                    {
                        email: cleanEmail
                    },
                    {
                        phone:
                            registration.phone
                    }
                ]

            });


        if (existingUser) {

            await RegistrationOTP.deleteOne({
                _id: registration._id
            });

            return res.status(400).json({

                message:
                    "Email or phone already registered"

            });

        }


        // ==========================================
        // CREATE USER NOW
        // ==========================================

        const user =
            await User.create({

                name:
                    registration.name,

                phone:
                    registration.phone,

                email:
                    registration.email,

                location:
                    registration.location,

                role:
                    registration.role,

                password:
                    registration.password

            });


        // Delete OTP after successful verification
        await RegistrationOTP.deleteOne({

            _id: registration._id

        });


        // Create JWT
        const token =
            jwt.sign(

                {
                    id: user._id,

                    role: user.role

                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.status(201).json({

            message:
                "Email verified and account created successfully",

            token,

            user: {

                id: user._id,

                name: user.name,

                phone: user.phone,

                email: user.email,

                location: user.location,

                role: user.role

            }

        });

    }

    catch (error) {

        console.error(
            "VERIFY REGISTRATION OTP ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to verify OTP"

        });

    }

};



// ==========================================
// LOGIN
// ==========================================

const loginUser = async (req, res) => {

    try {

        const {
            loginUser,
            password
        } = req.body;


        if (!loginUser || !password) {

            return res.status(400).json({

                message:
                    "Email/phone and password are required"

            });

        }


        const user =
            await User.findOne({

                $or: [

                    {
                        email:
                            loginUser
                                .toLowerCase()
                                .trim()
                    },

                    {
                        phone:
                            loginUser.trim()
                    }

                ]

            });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email/phone or password"

            });

        }


        const validPassword =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!validPassword) {

            return res.status(401).json({

                message:
                    "Invalid email/phone or password"

            });

        }


        const token =
            jwt.sign(

                {
                    id: user._id,

                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.status(200).json({

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                phone: user.phone,

                email: user.email,

                location: user.location,

                role: user.role

            }

        });

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Server error"

        });

    }

};



// ==========================================
// FORGOT PASSWORD
// SEND OTP
// ==========================================

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required"

            });

        }


        const cleanEmail =
            email.toLowerCase().trim();


        const user =
            await User.findOne({

                email: cleanEmail

            });


        if (!user) {

            return res.status(404).json({

                message:
                    "No account found with this email"

            });

        }


        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await PasswordReset.deleteMany({

            email: cleanEmail

        });


        await PasswordReset.create({

            email: cleanEmail,

            otp: otp,

            expiresAt: expiresAt

        });


        await transporter.sendMail({

            from:
                process.env.BREVO_FROM_EMAIL,

            to:
                cleanEmail,

            subject:
                "Connect Us - Password Reset OTP",

            text:
`Hello ${user.name},

Your Connect Us password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.

Connect Us
For the People, By the People`

        });


        res.json({

            message:
                "OTP sent successfully"

        });

    }

    catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to send OTP"

        });

    }

};



// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;


        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({

                message:
                    "Email, OTP and new password are required"

            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters"

            });

        }


        const cleanEmail =
            email.toLowerCase().trim();


        const reset =
            await PasswordReset.findOne({

                email: cleanEmail,

                otp: otp

            });


        if (!reset) {

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }


        if (
            new Date() >
            reset.expiresAt
        ) {

            await PasswordReset.deleteOne({

                _id: reset._id

            });

            return res.status(400).json({

                message:
                    "OTP has expired"

            });

        }


        const user =
            await User.findOne({

                email: cleanEmail

            });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        const hashedPassword =
            await bcrypt.hash(

                newPassword,

                10

            );


        user.password =
            hashedPassword;


        await user.save();


        await PasswordReset.deleteOne({

            _id: reset._id

        });


        res.json({

            message:
                "Password reset successfully"

        });

    }

    catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to reset password"

        });

    }

};



// ==========================================
// EXPORT
// ==========================================

module.exports = {

    sendRegistrationOTP,

    verifyRegistrationOTP,

    loginUser,

    forgotPassword,

    resetPassword

};