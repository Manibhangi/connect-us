const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const nodemailer = require("nodemailer");

const mongoose = require("mongoose");


// =====================================================
// JWT TOKEN
// =====================================================

function createToken(user) {

    return jwt.sign(

        {
            id: user._id.toString(),
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

}


// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({

    host:
        process.env.SMTP_HOST ||
        "smtp-relay.brevo.com",

    port:
        Number(process.env.SMTP_PORT) || 587,

    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }

});


// =====================================================
// EMAIL FORMAT VALIDATION
// =====================================================

function isValidEmail(email) {

    const value =
        String(email || "")
            .trim()
            .toLowerCase();


    if (!value) {
        return false;
    }


    if (value.length > 254) {
        return false;
    }


    if (/\s/.test(value)) {
        return false;
    }


    if (value.includes("..")) {
        return false;
    }


    const parts =
        value.split("@");


    if (parts.length !== 2) {
        return false;
    }


    const localPart =
        parts[0];


    const domain =
        parts[1];


    if (!localPart || !domain) {
        return false;
    }


    if (
        localPart.startsWith(".") ||
        localPart.endsWith(".")
    ) {
        return false;
    }


    if (
        !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(
            localPart
        )
    ) {
        return false;
    }


    const domainParts =
        domain.split(".");


    if (domainParts.length < 2) {
        return false;
    }


    for (const part of domainParts) {

        if (!part) {
            return false;
        }


        if (
            part.startsWith("-") ||
            part.endsWith("-")
        ) {
            return false;
        }


        if (
            !/^[A-Za-z0-9-]+$/.test(part)
        ) {
            return false;
        }

    }


    const tld =
        domainParts[
            domainParts.length - 1
        ];


    if (
        !/^[A-Za-z]{2,63}$/.test(tld)
    ) {
        return false;
    }


    return true;

}


// =====================================================
// PHONE VALIDATION
// =====================================================

function isValidIndianPhone(phone) {

    const value =
        String(phone || "").trim();

    // Exactly 10 digits.
    // Indian mobile number starts with 6, 7, 8 or 9.
    return /^[6-9][0-9]{9}$/.test(value);

}


// =====================================================
// REGISTRATION OTP MODEL
// =====================================================

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
                unique: true,
                trim: true,
                index: true
            },

            passwordHash: {
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

            otpHash: {
                type: String,
                required: true
            },

            otpExpiresAt: {
                type: Date,
                required: true,
                index: true
            },

            otpLastSentAt: {
                type: Date,
                required: true
            },

            otpAttempts: {
                type: Number,
                default: 0
            }

        },

        {
            timestamps: true
        }

    );


registrationOtpSchema.index(
    {
        otpExpiresAt: 1
    },
    {
        expireAfterSeconds: 0
    }
);


const RegistrationOTP =
    mongoose.models.RegistrationOTP ||
    mongoose.model(
        "RegistrationOTP",
        registrationOtpSchema
    );


// =====================================================
// REGISTRATION OTP SETTINGS
// =====================================================

const REGISTRATION_OTP_EXPIRY_MS =
    10 * 60 * 1000;

const REGISTRATION_OTP_RESEND_COOLDOWN_MS =
    60 * 1000;

const REGISTRATION_OTP_MAX_ATTEMPTS =
    5;


// =====================================================
// OTP HELPERS
// =====================================================

function generateSixDigitOtp() {

    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();

}


function hashOtp(otp) {

    return crypto
        .createHash("sha256")
        .update(String(otp))
        .digest("hex");

}


function safeCompareOtpHash(
    submittedHash,
    storedHash
) {

    try {

        const submittedBuffer =
            Buffer.from(
                submittedHash,
                "hex"
            );

        const storedBuffer =
            Buffer.from(
                storedHash,
                "hex"
            );


        if (
            submittedBuffer.length !==
            storedBuffer.length
        ) {
            return false;
        }


        return crypto.timingSafeEqual(
            submittedBuffer,
            storedBuffer
        );

    } catch (error) {

        return false;

    }

}


// =====================================================
// SEND REGISTRATION OTP EMAIL
// =====================================================

async function sendRegistrationOtpEmail(
    email,
    otp
) {

    await transporter.sendMail({

        from:
            process.env.SMTP_FROM,

        to:
            email,

        subject:
            "Connect Us - Email Verification OTP",

        html: `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 520px;
                margin: auto;
                padding: 30px;
                border: 1px solid #dddddd;
                border-radius: 15px;
            ">

                <h2 style="
                    color: #111511;
                ">
                    Connect Us
                </h2>

                <p>
                    Welcome to Connect Us.
                    We received a request to create your account.
                </p>

                <p>
                    Your email verification OTP is:
                </p>

                <div style="
                    text-align: center;
                    margin: 25px 0;
                ">

                    <span style="
                        display: inline-block;
                        padding: 15px 25px;
                        background: #111511;
                        color: white;
                        border-radius: 10px;
                        font-size: 30px;
                        font-weight: bold;
                        letter-spacing: 8px;
                    ">
                        ${otp}
                    </span>

                </div>

                <p>
                    This OTP will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p>
                    Never share this OTP with anyone.
                </p>

                <hr>

                <p style="
                    color: #777777;
                    font-size: 13px;
                ">
                    Connect Us<br>
                    Local help, one connection away.
                </p>

            </div>

        `

    });

}


// =====================================================
// REGISTER
// SEND OTP ONLY
// =====================================================

const registerUser = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            role
        } = req.body || {};


        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please complete all required fields."

            });

        }


        // =================================================
        // CLEAN DATA
        // =================================================

        const cleanName =
            String(name).trim();

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanPhone =
            String(phone).trim();

        const cleanPassword =
            String(password);

        const cleanRole =
            String(role)
                .trim()
                .toLowerCase();


        // =================================================
        // NAME
        // =================================================

        if (
            cleanName.length < 2
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your full name."

            });

        }


        if (
            cleanName.length > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name is too long."

            });

        }


        // =================================================
        // EMAIL
        // =================================================

        if (
            !isValidEmail(cleanEmail)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid email address."

            });

        }


        // =================================================
        // PHONE
        // =================================================

        if (
            !isValidIndianPhone(
                cleanPhone
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."

            });

        }


        // =================================================
        // ROLE
        // =================================================

        if (
            ![
                "customer",
                "worker"
            ].includes(cleanRole)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid account type."

            });

        }


        // =================================================
        // PASSWORD
        // =================================================

        if (
            cleanPassword.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });

        }


        if (
            cleanPassword.length > 128
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password is too long."

            });

        }


        // =================================================
        // CHECK EXISTING USER
        // =================================================

        const existingUser =
            await User.findOne({

                $or: [

                    {
                        email:
                            cleanEmail
                    },

                    {
                        phone:
                            cleanPhone
                    }

                ]

            });


        if (existingUser) {

            if (
                existingUser.email ===
                cleanEmail
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered. Please use another email or log in."

                });

            }


            if (
                existingUser.phone ===
                cleanPhone
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This phone number is already registered. Please use another number or log in."

                });

            }

        }


        // =================================================
        // CHECK PENDING REGISTRATION
        // =================================================

        const existingPending =
            await RegistrationOTP.findOne({

                $or: [

                    {
                        email:
                            cleanEmail
                    },

                    {
                        phone:
                            cleanPhone
                    }

                ]

            });


        if (existingPending) {

            const elapsed =
                Date.now() -
                existingPending
                    .otpLastSentAt
                    .getTime();


            if (
                elapsed <
                REGISTRATION_OTP_RESEND_COOLDOWN_MS
            ) {

                const secondsLeft =
                    Math.ceil(
                        (
                            REGISTRATION_OTP_RESEND_COOLDOWN_MS -
                            elapsed
                        ) / 1000
                    );

                return res.status(429).json({

                    success: false,

                    message:
                        `Please wait ${secondsLeft} seconds before requesting another OTP.`

                });

            }


            await RegistrationOTP.deleteOne({
                _id:
                    existingPending._id
            });

        }


        // =================================================
        // GENERATE OTP
        // =================================================

        const otp =
            generateSixDigitOtp();

        const otpHash =
            hashOtp(otp);


        // =================================================
        // HASH PASSWORD
        // =================================================

        const passwordHash =
            await bcrypt.hash(
                cleanPassword,
                10
            );


        const now =
            new Date();


        const otpExpiresAt =
            new Date(
                now.getTime() +
                REGISTRATION_OTP_EXPIRY_MS
            );


        // =================================================
        // SAVE PENDING REGISTRATION
        // =================================================

        await RegistrationOTP.create({

            name:
                cleanName,

            email:
                cleanEmail,

            phone:
                cleanPhone,

            passwordHash:
                passwordHash,

            role:
                cleanRole,

            otpHash:
                otpHash,

            otpExpiresAt:
                otpExpiresAt,

            otpLastSentAt:
                now,

            otpAttempts:
                0

        });


        // =================================================
        // SEND OTP
        // =================================================

        try {

            await sendRegistrationOtpEmail(
                cleanEmail,
                otp
            );

        } catch (emailError) {

            console.error(
                "Registration OTP email error:",
                emailError
            );


            await RegistrationOTP.deleteOne({
                email:
                    cleanEmail
            });


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send verification OTP. Please check your email configuration and try again."

            });

        }


        // =================================================
        // DO NOT CREATE USER HERE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Verification OTP sent successfully to your email. The OTP is valid for 10 minutes."

        });


    } catch (error) {

        console.error(
            "Register error:",
            error
        );


        if (
            error.code === 11000
        ) {

            const field =
                Object.keys(
                    error.keyPattern || {}
                )[0];


            if (
                field === "phone"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This phone number is already registered. Please use another number or log in."

                });

            }


            if (
                field === "email"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered. Please use another email or log in."

                });

            }

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to start registration. Please try again."

        });

    }

};


// =====================================================
// VERIFY REGISTRATION OTP
// =====================================================

const verifyRegistrationOtp =
    async (
        req,
        res
    ) => {

        try {

            const {
                email,
                otp
            } = req.body || {};


            const cleanEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();

            const cleanOtp =
                String(otp || "")
                    .trim();


            // =============================================
            // VALIDATION
            // =============================================

            if (
                !cleanEmail ||
                !cleanOtp
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and OTP are required."

                });

            }


            if (
                !isValidEmail(
                    cleanEmail
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid email address."

                });

            }


            if (
                !/^[0-9]{6}$/.test(
                    cleanOtp
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 6-digit OTP."

                });

            }


            // =============================================
            // FIND PENDING REGISTRATION
            // =============================================

            const pending =
                await RegistrationOTP.findOne({

                    email:
                        cleanEmail

                });


            if (!pending) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No pending registration found. Please create your account again."

                });

            }


            // =============================================
            // OTP EXPIRY
            // =============================================

            if (
                !pending.otpExpiresAt ||
                new Date() >
                    pending.otpExpiresAt
            ) {

                await RegistrationOTP.deleteOne({

                    _id:
                        pending._id

                });


                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please create your account again."

                });

            }


            // =============================================
            // MAX ATTEMPTS
            // =============================================

            if (
                pending.otpAttempts >=
                REGISTRATION_OTP_MAX_ATTEMPTS
            ) {

                await RegistrationOTP.deleteOne({

                    _id:
                        pending._id

                });


                return res.status(429).json({

                    success: false,

                    message:
                        "Too many incorrect OTP attempts. Please create your account again."

                });

            }


            // =============================================
            // HASH SUBMITTED OTP
            // =============================================

            const submittedHash =
                hashOtp(
                    cleanOtp
                );


            const otpMatches =
                safeCompareOtpHash(
                    submittedHash,
                    pending.otpHash
                );


            // =============================================
            // WRONG OTP
            // =============================================

            if (!otpMatches) {

                pending.otpAttempts += 1;


                if (
                    pending.otpAttempts >=
                    REGISTRATION_OTP_MAX_ATTEMPTS
                ) {

                    await pending.deleteOne();


                    return res.status(429).json({

                        success: false,

                        message:
                            "Too many incorrect OTP attempts. Please create your account again."

                    });

                }


                await pending.save();


                const attemptsLeft =
                    REGISTRATION_OTP_MAX_ATTEMPTS -
                    pending.otpAttempts;


                return res.status(400).json({

                    success: false,

                    message:
                        `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`

                });

            }


            // =============================================
            // RE-CHECK EMAIL / PHONE
            // =============================================

            const existingUser =
                await User.findOne({

                    $or: [

                        {
                            email:
                                pending.email
                        },

                        {
                            phone:
                                pending.phone
                        }

                    ]

                });


            if (existingUser) {

                await RegistrationOTP.deleteOne({

                    _id:
                        pending._id

                });


                if (
                    existingUser.email ===
                    pending.email
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "This email is already registered. Please use another email or log in."

                    });

                }


                if (
                    existingUser.phone ===
                    pending.phone
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "This phone number is already registered. Please use another number or log in."

                    });

                }


                return res.status(409).json({

                    success: false,

                    message:
                        "An account with these details already exists."

                });

            }


            // =============================================
            // CREATE USER ONLY AFTER OTP VERIFICATION
            // =============================================

            let user;


            try {

                user =
                    await User.create({

                        name:
                            pending.name,

                        email:
                            pending.email,

                        phone:
                            pending.phone,

                        password:
                            pending.passwordHash,

                        role:
                            pending.role,

                        isVerified:
                            true

                    });

            } catch (createError) {

                if (
                    createError.code === 11000
                ) {

                    const field =
                        Object.keys(
                            createError.keyPattern ||
                            {}
                        )[0];


                    await RegistrationOTP.deleteOne({

                        _id:
                            pending._id

                    });


                    if (
                        field === "email"
                    ) {

                        return res.status(409).json({

                            success: false,

                            message:
                                "This email is already registered. Please use another email or log in."

                        });

                    }


                    if (
                        field === "phone"
                    ) {

                        return res.status(409).json({

                            success: false,

                            message:
                                "This phone number is already registered. Please use another number or log in."

                        });

                    }

                }


                throw createError;

            }


            // =============================================
            // DELETE PENDING OTP
            // =============================================

            await RegistrationOTP.deleteOne({

                _id:
                    pending._id

            });


            // =============================================
            // CREATE TOKEN
            // =============================================

            const token =
                createToken(user);


            // =============================================
            // SUCCESS
            // =============================================

            return res.status(201).json({

                success: true,

                message:
                    "Email verified successfully. Account created successfully.",

                token:
                    token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    role:
                        user.role

                }

            });


        } catch (error) {

            console.error(
                "Verify registration OTP error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify your registration. Please try again."

            });

        }

    };


// =====================================================
// RESEND REGISTRATION OTP
// =====================================================

const resendRegistrationOtp =
    async (
        req,
        res
    ) => {

        try {

            const {
                email
            } = req.body || {};


            const cleanEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();


            if (
                !cleanEmail
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter your email address."

                });

            }


            if (
                !isValidEmail(
                    cleanEmail
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid email address."

                });

            }


            // =============================================
            // FIND PENDING REGISTRATION
            // =============================================

            const pending =
                await RegistrationOTP.findOne({

                    email:
                        cleanEmail

                });


            if (!pending) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No pending registration found. Please create your account again."

                });

            }


            // =============================================
            // CHECK COOLDOWN
            // =============================================

            const elapsed =
                Date.now() -
                pending
                    .otpLastSentAt
                    .getTime();


            if (
                elapsed <
                REGISTRATION_OTP_RESEND_COOLDOWN_MS
            ) {

                const secondsLeft =
                    Math.ceil(
                        (
                            REGISTRATION_OTP_RESEND_COOLDOWN_MS -
                            elapsed
                        ) / 1000
                    );


                return res.status(429).json({

                    success: false,

                    message:
                        `Please wait ${secondsLeft} seconds before requesting another OTP.`

                });

            }


            // =============================================
            // CHECK EXPIRY
            // =============================================

            if (
                !pending.otpExpiresAt ||
                new Date() >
                    pending.otpExpiresAt
            ) {

                await RegistrationOTP.deleteOne({

                    _id:
                        pending._id

                });


                return res.status(400).json({

                    success: false,

                    message:
                        "Registration OTP has expired. Please create your account again."

                });

            }


            // =============================================
            // GENERATE NEW OTP
            // =============================================

            const otp =
                generateSixDigitOtp();


            const otpHash =
                hashOtp(otp);


            pending.otpHash =
                otpHash;


            pending.otpExpiresAt =
                new Date(
                    Date.now() +
                    REGISTRATION_OTP_EXPIRY_MS
                );


            pending.otpLastSentAt =
                new Date();


            pending.otpAttempts =
                0;


            await pending.save();


            // =============================================
            // SEND NEW OTP
            // =============================================

            try {

                await sendRegistrationOtpEmail(
                    pending.email,
                    otp
                );

            } catch (emailError) {

                console.error(
                    "Resend registration OTP email error:",
                    emailError
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to send OTP. Please check your email configuration and try again."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "A new verification OTP has been sent to your email. The OTP is valid for 10 minutes."

            });


        } catch (error) {

            console.error(
                "Resend registration OTP error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to resend OTP. Please try again."

            });

        }

    };


// =====================================================
// LOGIN
// =====================================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // =========================================
        // EMPTY FIELDS
        // =========================================

        if (!email && !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email."

            });

        }


        if (!password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your password."

            });

        }


        // =========================================
        // NORMALIZE EMAIL
        // =========================================

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        // =========================================
        // VALIDATE EMAIL FORMAT
        // =========================================

        if (!isValidEmail(cleanEmail)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid email address."

            });

        }


        // =========================================
        // CHECK EMAIL IN MONGODB
        // =========================================

        const user =
            await User.findOne({

                email:
                    cleanEmail

            });


        // =========================================
        // EMAIL NOT REGISTERED
        // =========================================

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Email address is not registered."

            });

        }


        // =========================================
        // CHECK PASSWORD
        // =========================================

        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        // =========================================
        // WRONG PASSWORD
        // =========================================

        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Incorrect password."

            });

        }


        // =========================================
        // CREATE JWT
        // =========================================

        const token =
            createToken(user);


        // =========================================
        // SUCCESS
        // =========================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token:
                token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to login. Please try again."

        });

    }

};


// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

const forgotPassword = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email address."

            });

        }


        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        if (!isValidEmail(cleanEmail)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid email address."

            });

        }


        const user =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "No account found with this email."

            });

        }


        // Generate 6 digit OTP

        const otp =
            crypto.randomInt(
                100000,
                1000000
            ).toString();


        // Hash OTP

        const otpHash =
            crypto
                .createHash("sha256")
                .update(otp)
                .digest("hex");


        user.resetOtpHash =
            otpHash;


        user.resetOtpExpires =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        await user.save();


        // Send OTP email

        await transporter.sendMail({

            from:
                process.env.SMTP_FROM,

            to:
                user.email,

            subject:
                "Connect Us - Password Reset OTP",

            html: `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 520px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #dddddd;
                    border-radius: 15px;
                ">

                    <h2 style="
                        color: #111511;
                    ">
                        Connect Us
                    </h2>

                    <p>
                        We received a request to reset
                        your Connect Us password.
                    </p>

                    <p>
                        Your OTP is:
                    </p>

                    <div style="
                        text-align: center;
                        margin: 25px 0;
                    ">

                        <span style="
                            display: inline-block;
                            padding: 15px 25px;
                            background: #111511;
                            color: white;
                            border-radius: 10px;
                            font-size: 30px;
                            font-weight: bold;
                            letter-spacing: 8px;
                        ">
                            ${otp}
                        </span>

                    </div>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password
                        reset, please ignore this email.
                    </p>

                    <hr>

                    <p style="
                        color: #777777;
                        font-size: 13px;
                    ">
                        Connect Us<br>
                        Local help, one connection away.
                    </p>

                </div>

            `

        });


        return res.status(200).json({

            success: true,

            message:
                "OTP sent successfully to your email."

        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send OTP. Please check your email configuration."

        });

    }

};


// =====================================================
// VERIFY OTP
// =====================================================

const verifyOtp = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and OTP are required."

            });

        }


        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found."

            });

        }


        if (
            !user.resetOtpHash ||
            !user.resetOtpExpires
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No OTP request found. Please generate a new OTP."

            });

        }


        if (
            new Date() >
            user.resetOtpExpires
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please generate a new OTP."

            });

        }


        const otpHash =
            crypto
                .createHash("sha256")
                .update(
                    otp.toString()
                )
                .digest("hex");


        if (
            otpHash !==
            user.resetOtpHash
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "OTP verified successfully."

        });


    } catch (error) {

        console.error(
            "Verify OTP error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify OTP."

        });

    }

};


// =====================================================
// RESET PASSWORD
// =====================================================

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

                success: false,

                message:
                    "Email, OTP and new password are required."

            });

        }


        if (
            newPassword.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });

        }


        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        const user =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found."

            });

        }


        if (
            !user.resetOtpHash ||
            !user.resetOtpExpires
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please generate a new OTP."

            });

        }


        if (
            new Date() >
            user.resetOtpExpires
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired."

            });

        }


        const otpHash =
            crypto
                .createHash("sha256")
                .update(
                    otp.toString()
                )
                .digest("hex");


        if (
            otpHash !==
            user.resetOtpHash
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP."

            });

        }


        // Create new password

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        // Remove OTP

        user.resetOtpHash =
            null;


        user.resetOtpExpires =
            null;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully."

        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to reset password."

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    registerUser,

    verifyRegistrationOtp,

    resendRegistrationOtp,

    loginUser,

    forgotPassword,

    verifyOtp,

    resetPassword

};