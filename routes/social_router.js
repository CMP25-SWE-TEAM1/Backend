const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config({ path: './config/dev.env' });
const passport = require("passport");

const CLIENT_URL = process.env.CLIENT_URL;


router.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "successful",
            user: req.user,
        });
    }
});