const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");

const Listing = require("../models/listing");
const Review = require("../models/review");

const ExpressError = require("../utils/ExpressError.js");

// Validation

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(400, msg);
  }

  next();
};

// Reviews

// CREATE
router.post(
  "/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    const review = new Review(req.body.review);

    await review.save();

    listing.reviews.push(review._id);

    await listing.save();
    req.flash("success", "Successfully created a new review!");

    res.redirect(`/listings/${id}`);
  }),
);

// DELETE
router.delete(
  "/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    // Remove review reference from listing
    listing.reviews.pull(reviewId);

    await listing.save();

    // Delete review document
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");

    res.redirect(`/listings/${id}`);
  }),
);

module.exports = router;
