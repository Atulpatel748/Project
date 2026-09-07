const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");

const Listing = require("../models/listing");

const ExpressError = require("../utils/ExpressError.js");

// --------------------------------------------------
// Validation Middleware
// --------------------------------------------------

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(400, errMsg);
  }

  next();
};

// --------------------------------------------------
// Listings Routes
// --------------------------------------------------

// INDEX - Show all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});

    res.render("listings/index", {
      allListings,
    });
  }),
);

// NEW - Show form to create a listing
router.get(
  "/new",
  wrapAsync(async (req, res) => {
    res.render("listings/new");
  }),
);

// EDIT - Show edit form
// IMPORTANT: This must come BEFORE /:id
router.get(
  "/:id/edit",
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

// SHOW - Show one listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
      listing,
    });
  }),
);

// CREATE - Create a new listing
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");

    res.redirect("/listings");
  }),
);

// UPDATE - Update listing
router.put(
  "/:id",
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

// DELETE - Delete listing
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      throw new ExpressError(404, "Listing not found");
    }

    console.log("Deleted listing:", deletedListing);
    req.flash("success", "Successfully deleted the listing!");

    res.redirect("/listings");
  }),
);

module.exports = router;
