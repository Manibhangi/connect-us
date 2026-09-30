const express = require("express");

const router = express.Router();

const {
    addService,
    getMyServices,
    getAllServices,
    deleteService
} = require("../controllers/serviceControllers");

const authMiddleware =
    require("../middleware/authMiddleware");


/* =========================================
   GET ALL SERVICES
========================================= */

router.get(
    "/",
    getAllServices
);


/* =========================================
   GET MY SERVICES
========================================= */

router.get(
    "/my",
    authMiddleware,
    getMyServices
);


/* =========================================
   ADD SERVICE
========================================= */

router.post(
    "/",
    authMiddleware,
    addService
);


/* =========================================
   DELETE SERVICE
========================================= */

router.delete(
    "/:id",
    authMiddleware,
    deleteService
);


module.exports = router;