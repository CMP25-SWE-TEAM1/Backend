const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config({ path: './config/dev.env' });
const passport = require("passport");

const CLIENT_URL = process.env.CLIENT_URL;

