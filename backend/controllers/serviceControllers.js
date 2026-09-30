const Service = require("../models/Service");


/* =========================================
   ADD SERVICE
========================================= */

const addService = async (req, res) => {

    try {

        const workerId = req.user?.id;

        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }


        const {
            name,
            category,
            price,
            description
        } = req.body;


        if (!name || !category) {

            return res.status(400).json({
                success: false,
                message:
                    "Service name and category are required."
            });
        }


        const service =
            await Service.create({
                worker: workerId,

                name:
                    String(name).trim(),

                category:
                    String(category).trim(),

                price:
                    Number(price) || 0,

                description:
                    String(description || "").trim(),

                isAvailable:
                    true
            });


        return res.status(201).json({
            success: true,

            message:
                "Service added successfully.",

            service
        });

    } catch (error) {

        console.error(
            "ADD SERVICE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to add service."
        });
    }
};


/* =========================================
   GET MY SERVICES
========================================= */

const getMyServices = async (req, res) => {

    try {

        const workerId = req.user?.id;

        if (!workerId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }


        const services =
            await Service.find({
                worker: workerId
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
            services
        });

    } catch (error) {

        console.error(
            "GET MY SERVICES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load services."
        });
    }
};


/* =========================================
   GET ALL SERVICES
========================================= */

const getAllServices = async (req, res) => {

    try {

        const services =
            await Service.find({
                isAvailable: true
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
            services
        });

    } catch (error) {

        console.error(
            "GET ALL SERVICES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load services."
        });
    }
};


/* =========================================
   DELETE SERVICE
========================================= */

const deleteService = async (req, res) => {

    try {

        const workerId = req.user?.id;

        if (!workerId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }


        const service =
            await Service.findOneAndDelete({
                _id: req.params.id,
                worker: workerId
            });


        if (!service) {

            return res.status(404).json({
                success: false,
                message:
                    "Service not found."
            });
        }


        return res.status(200).json({
            success: true,
            message:
                "Service deleted successfully."
        });

    } catch (error) {

        console.error(
            "DELETE SERVICE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete service."
        });
    }
};


/* =========================================
   EXPORTS
========================================= */

module.exports = {
    addService,
    getMyServices,
    getAllServices,
    deleteService
};