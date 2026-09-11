const Job = require("../models/Job");


// =====================================
// CREATE JOB
// =====================================

const createJob = async (req, res) => {

    try {

        console.log("CREATE JOB REQUEST:");
        console.log(req.body);

        const {
            customer,
            service,
            description,
            location,
            budget
        } = req.body;


        if (
            !customer ||
            !service ||
            !description ||
            !location ||
            !budget
        ) {

            return res.status(400).json({
                message: "Please fill all fields"
            });

        }


        const job = await Job.create({

            customer,

            worker: null,

            service,

            description,

            location,

            budget: Number(budget),

            status: "available"

        });


        console.log("JOB CREATED:", job);


        res.status(201).json({

            message: "Job created successfully",

            job

        });

    }

    catch (error) {

        console.log("CREATE JOB ERROR:", error);

        res.status(500).json({

            message: "Failed to create job",

            error: error.message

        });

    }

};


// =====================================
// GET AVAILABLE JOBS
// FOR WORKERS
// =====================================

const getAvailableJobs = async (req, res) => {

    console.log("AVAILABLE JOBS API CALLED");

    try {

        const jobs = await Job.find({

            status: "available"

        })
        .populate(
            "customer",
            "name phone email location"
        );


        console.log(
            "AVAILABLE JOB COUNT:",
            jobs.length
        );


        res.json({

            jobs

        });

    }

    catch (error) {

        console.log(
            "GET AVAILABLE JOB ERROR:",
            error
        );

        res.status(500).json({

            message: "Failed to get available jobs"

        });

    }

};


// =====================================
// GET CUSTOMER'S JOBS
// =====================================

const getCustomerJobs = async (req, res) => {

    try {

        const customerId =
            req.params.customerId;


        console.log(
            "CUSTOMER JOBS REQUEST:",
            customerId
        );


        const jobs = await Job.find({

            customer: customerId

        })
        .populate(
            "customer",
            "name phone email location"
        )
        .populate(
            "worker",
            "name phone email location"
        )
        .sort({
            createdAt: -1
        });


        console.log(
            "CUSTOMER JOB COUNT:",
            jobs.length
        );


        res.json({

            jobs

        });

    }

    catch (error) {

        console.log(
            "CUSTOMER JOB ERROR:",
            error
        );

        res.status(500).json({

            message: "Failed to get customer jobs",

            error: error.message

        });

    }

};


// =====================================
// ACCEPT JOB
// =====================================

const acceptJob = async (req, res) => {

    try {

        const {
            worker
        } = req.body;


        if (!worker) {

            return res.status(400).json({

                message: "Worker ID is required"

            });

        }


        const job =
            await Job.findByIdAndUpdate(

                req.params.id,

                {

                    worker: worker,

                    status: "accepted"

                },

                {

                    new: true

                }

            )
            .populate(
                "customer",
                "name phone email location"
            )
            .populate(
                "worker",
                "name phone email location"
            );


        if (!job) {

            return res.status(404).json({

                message: "Job not found"

            });

        }


        console.log(
            "JOB ACCEPTED:",
            job
        );


        res.json({

            message:
                "Job accepted successfully",

            job

        });

    }

    catch (error) {

        console.log(
            "ACCEPT JOB ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to accept job",

            error: error.message

        });

    }

};


module.exports = {

    createJob,

    getAvailableJobs,

    getCustomerJobs,

    acceptJob

};