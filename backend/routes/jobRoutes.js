const express = require("express");

const router = express.Router();

const {
    createJob,
    getMyJobs,
    getAvailableJobs,
    getJobById,
    acceptJob,
    rejectJob,
    completeJob
} = require("../controllers/jobController");


/* =========================================
   CREATE JOB
========================================= */

router.post(
    "/",
    createJob
);


/* =========================================
   CUSTOMER JOBS
========================================= */

router.get(
    "/my",
    getMyJobs
);


/* =========================================
   AVAILABLE JOBS
========================================= */

router.get(
    "/available",
    getAvailableJobs
);


/* =========================================
   ACCEPT JOB
========================================= */

router.put(
    "/:id/accept",
    acceptJob
);


/* =========================================
   REJECT JOB
========================================= */

router.put(
    "/:id/reject",
    rejectJob
);


/* =========================================
   COMPLETE JOB
========================================= */

router.put(
    "/:id/complete",
    completeJob
);


/* =========================================
   GET SINGLE JOB
========================================= */

router.get(
    "/:id",
    getJobById
);


module.exports = router;