const jwt = require("jsonwebtoken");


// =========================================
// AUTHENTICATION MIDDLEWARE
// =========================================

const authMiddleware = (req, res, next) => {

    try {

        // Get Authorization header
        const authHeader =
            req.headers.authorization;


        // Check if token exists
        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Authentication required."

            });

        }


        // Expected format:
        // Authorization: Bearer TOKEN

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format."

            });

        }


        // Extract token
        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Authentication token missing."

            });

        }


        // Verify JWT
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store decoded user information
        // so controllers can access it
        req.user = decoded;


        // Continue to requested route
        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message: "Invalid or expired authentication token."

        });

    }

};


module.exports = authMiddleware;