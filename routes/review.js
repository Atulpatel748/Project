const express = require("express");
const router = express.Router({ mergeParams: true });


const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing");
const Review = require("../models/review");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const ExpressError = require("../utils/ExpressError.js");

// CREATE
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review._id);

    await review.save();
    await listing.save();
    req.flash("success", "Successfully created a new review!");

    res.redirect(`/listings/${listing._id}`);
  }),
);

// DELETE
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
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
