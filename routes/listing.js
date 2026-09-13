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

// INDEX
router.get("/", wrapAsync(listingController.index));

// NEW
router.get("/new", isLoggedIn, wrapAsync(listingController.newForm));

// EDIT (before :id)
router.get(
  "/:id/edit",
  isLoggedIn,
  isListingOwner,
  wrapAsync(listingController.editForm),
);

// SHOW
router.get("/:id", wrapAsync(listingController.show));

// CREATE
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.create),
);

// UPDATE
router.put(
  "/:id",
  isLoggedIn,
  isListingOwner,
  validateListing,
  wrapAsync(listingController.update),
);

// DELETE
router.delete(
  "/:id",
  isLoggedIn,
  isListingOwner,
  wrapAsync(listingController.deleteListing),
);

module.exports = router;
