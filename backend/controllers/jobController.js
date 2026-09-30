const Job = require("../models/job");
const User = require("../models/User");


/* =====================================================
   CREATE JOB
===================================================== */

const createJob = async (req, res) => {

    try {

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
            !location
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer, service, description and location are required."
            });
        }


        const customerUser =
            await User.findById(customer);


        if (!customerUser) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }


        if (
            customerUser.role !== "customer"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only customers can create jobs."
            });
        }


        const job =
            await Job.create({

                customer,

                service:
                    service.trim(),

                description:
                    description.trim(),

                location:
                    location.trim(),

                budget:
                    Number(budget) || 0,

                status:
                    "pending"
            });


        const savedJob =
            await Job.findById(
                job._id
            )
            .populate(
                "customer",
                "name email phone"
            );


        return res.status(201).json({
            success: true,
            message:
                "Job posted successfully.",
            job: savedJob
        });

    } catch (error) {

        console.error(
            "CREATE JOB ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to create job."
        });
    }
};


/* =====================================================
   CUSTOMER JOBS
===================================================== */

const getMyJobs = async (req, res) => {

    try {

        const customerId =
            req.user?.id ||
            req.query.customer;


        if (!customerId) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer ID is required."
            });
        }


        const jobs =
            await Job.find({
                customer: customerId
            })
            .populate(
                "worker",
                "name email phone"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({
            success: true,
            jobs
        });

    } catch (error) {

        console.error(
            "GET MY JOBS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load your jobs."
        });
    }
};


/* =====================================================
   AVAILABLE JOBS FOR WORKER
===================================================== */

const getAvailableJobs = async (req, res) => {

    try {

        const jobs =
            await Job.find({
                status: "pending",
                worker: null
            })
            .populate(
                "customer",
                "name email phone"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({
            success: true,
            jobs
        });

    } catch (error) {

        console.error(
            "GET AVAILABLE JOBS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load available jobs."
        });
    }
};


/* =====================================================
   GET SINGLE JOB
===================================================== */

const getJobById = async (req, res) => {

    try {

        const job =
            await Job.findById(
                req.params.id
            )
            .populate(
                "customer",
                "name email phone"
            )
            .populate(
                "worker",
                "name email phone"
            );


        if (!job) {
            return res.status(404).json({
                success: false,
                message:
                    "Job not found."
            });
        }


        return res.status(200).json({
            success: true,
            job
        });

    } catch (error) {

        console.error(
            "GET JOB ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load job."
        });
    }
};


/* =====================================================
   ACCEPT JOB
===================================================== */

const acceptJob = async (req, res) => {

    try {

        const workerId =
            req.user?.id ||
            req.body?.worker;


        if (!workerId) {
            return res.status(400).json({
                success: false,
                message:
                    "Worker ID is required."
            });
        }


        const worker =
            await User.findById(
                workerId
            );


        if (!worker) {
            return res.status(404).json({
                success: false,
                message:
                    "Worker not found."
            });
        }


        if (
            worker.role !== "worker"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only workers can accept jobs."
            });
        }


        const job =
            await Job.findOneAndUpdate(

                {
                    _id:
                        req.params.id,

                    status:
                        "pending",

                    worker:
                        null
                },

                {
                    $set: {

                        worker:
                            workerId,

                        status:
                            "accepted"
                    }
                },

                {
                    new: true
                }
            )
            .populate(
                "customer",
                "name email phone"
            )
            .populate(
                "worker",
                "name email phone"
            );


        if (!job) {

            return res.status(409).json({
                success: false,
                message:
                    "This job has already been accepted or is no longer available."
            });
        }


        return res.status(200).json({
            success: true,
            message:
                "Job accepted successfully.",
            job
        });

    } catch (error) {

        console.error(
            "ACCEPT JOB ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to accept job."
        });
    }
};


/* =====================================================
   REJECT JOB
===================================================== */

const rejectJob = async (req, res) => {

    try {

        const job =
            await Job.findOneAndUpdate(

                {
                    _id:
                        req.params.id,

                    status:
                        "pending"
                },

                {
                    $set: {
                        status:
                            "rejected"
                    }
                },

                {
                    new: true
                }
            );


        if (!job) {

            return res.status(404).json({
                success: false,
                message:
                    "Job not found or already processed."
            });
        }


        return res.status(200).json({
            success: true,
            message:
                "Job rejected successfully.",
            job
        });

    } catch (error) {

        console.error(
            "REJECT JOB ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to reject job."
        });
    }
};


/* =====================================================
   COMPLETE JOB
===================================================== */

const completeJob = async (req, res) => {

    try {

        const job =
            await Job.findById(
                req.params.id
            );


        if (!job) {

            return res.status(404).json({
                success: false,
                message:
                    "Job not found."
            });
        }


        if (
            job.status !== "accepted"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Only accepted jobs can be completed."
            });
        }


        job.status =
            "completed";

        await job.save();


        return res.status(200).json({
            success: true,
            message:
                "Job completed successfully.",
            job
        });

    } catch (error) {

        console.error(
            "COMPLETE JOB ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to complete job."
        });
    }
};


module.exports = {

    createJob,
    getMyJobs,
    getAvailableJobs,
    getJobById,
    acceptJob,
    rejectJob,
    completeJob

};