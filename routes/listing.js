const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  isLoggedIn,
  isListingOwner,
  validateListing,
} = require("../middleware.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const { authorize } = require("passport");
const listingController = require("../controllers/listingController");

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, validateListing, wrapAsync(listingController.create));

// NEW
router.get("/new", isLoggedIn, wrapAsync(listingController.newForm));

// EDIT (before :id)
router.get(
  "/:id/edit",
  isLoggedIn,
  isListingOwner,
  wrapAsync(listingController.editForm),
);

// SHOW, UPDATE, DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(isLoggedIn, isListingOwner, validateListing, wrapAsync(listingController.update))
  .delete(isLoggedIn, isListingOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
