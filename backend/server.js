const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


/* =========================================
   DATABASE
========================================= */

const connectDB = require("./config/db");


/* =========================================
   ROUTES
========================================= */

const authRoutes =
    require("./routes/authRoutes");

const jobRoutes =
    require("./routes/jobRoutes");

const serviceRoutes =
    require("./routes/serviceRoutes");


/* =========================================
   APP
========================================= */

const app = express();


/* =========================================
   DATABASE CONNECTION
========================================= */

connectDB();


/* =========================================
   CORS
========================================= */

app.use(
    cors({
        origin: "*",

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


/* =========================================
   BODY PARSER
========================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   HOME
========================================= */

app.get(
    "/",
    (req, res) => {

        res.status(200).json({
            success: true,
            project: "Connect Us",
            message:
                "Connect Us Backend API is running",
            status: "online"
        });

    }
);


/* =========================================
   HEALTH
========================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({
            success: true,
            message:
                "API is working correctly",
            timestamp:
                new Date().toISOString()
        });

    }
);


/* =========================================
   AUTH ROUTES
========================================= */

app.use(
    "/api/auth",
    authRoutes
);


/* =========================================
   SERVICE ROUTES
========================================= */

app.use(
    "/api/services",
    serviceRoutes
);


/* =========================================
   JOB ROUTES
========================================= */

app.use(
    "/api/jobs",
    jobRoutes
);


/* =========================================
   404
========================================= */

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message:
                "API route not found"
        });

    }
);


/* =========================================
   ERROR HANDLER
========================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Internal server error"
        });

    }
);


/* =========================================
   START SERVER
========================================= */

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "        CONNECT US BACKEND"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
            `Auth: http://localhost:${PORT}/api/auth`
        );

        console.log(
            `Jobs: http://localhost:${PORT}/api/jobs`
        );

        console.log(
            `Services: http://localhost:${PORT}/api/services`
        );

        console.log(
            "========================================"
        );

    }
);