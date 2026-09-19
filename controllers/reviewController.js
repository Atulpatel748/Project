const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError.js");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  listing.reviews.push(review._id);

  await review.save();
  await listing.save();
  req.flash("success", "Successfully created a new review!");

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
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
};
