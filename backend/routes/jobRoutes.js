const express = require("express");

const router = express.Router();


const {

    createJob,

    getAvailableJobs,

    getCustomerJobs,

    acceptJob

} = require("../controllers/jobController");


// =====================================
// CREATE JOB
// =====================================

router.post(
    "/",
    createJob
);


// =====================================
// AVAILABLE JOBS
// WORKER
// =====================================

router.get(
    "/available",
    getAvailableJobs
);


// =====================================
// CUSTOMER'S JOBS
// =====================================

router.get(
    "/customer/:customerId",
    getCustomerJobs
);


// =====================================
// ACCEPT JOB
// =====================================

router.put(
    "/:id/accept",
    acceptJob
);


module.exports = router;