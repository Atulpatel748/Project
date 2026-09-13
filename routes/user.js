const express = require("express");

const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveReturnTo } = require("../middleware");
const userController = require("../controllers/usersController.js");

// Users
const router = express.Router();

router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.renderSignupForm);

router.post(
  "/login",
  saveReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  userController.login,
);
router.get("/logout", userController.logout);

module.exports = router;
