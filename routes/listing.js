const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware.js");

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");

const Listing = require("../models/listing");

const ExpressError = require("../utils/ExpressError.js");

// Validation

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(400, errMsg);
  }

  next();
};

// Listings

// INDEX
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});

    res.render("listings/index", {
      allListings,
    });
  }),
);

// NEW
router.get(
  "/new",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    res.render("listings/new");
  }),
);

// EDIT (before :id)
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/edit", {
      listing,
    });
  }),
);

// SHOW
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
      listing,
    });
  }),
);

// CREATE
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing({
      ...req.body.listing,
      owner: req.user._id,
    });

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");

    res.redirect("/listings");
  }),
);

// UPDATE
router.put(
  "/:id",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
      id,
      {
        ...req.body.listing,
      },
      {
        runValidators: true,
        new: true,
      },
    );

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
  }),
);

// DELETE
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      throw new ExpressError(404, "Listing not found");
    }

    req.flash("success", "Successfully deleted the listing!");

    res.redirect("/listings");
  }),
);

module.exports = router;
