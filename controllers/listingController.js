const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.newForm = async (req, res) => {
  res.render("listings/new");
};

module.exports.editForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

module.exports.show = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  // Compute a transformed image URL (Cloudinary transformation) if an image exists
  let transformedImageUrl = null;
  if (listing.image && listing.image.url) {
    transformedImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
  }
  // Pass the transformed URL to the template (falls back to listing.image.url in the view if null)
  res.render("listings/show.ejs", { listing, transformedImageUrl });
};

module.exports.create = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing({
    ...req.body.listing,
    owner: req.user._id,
  });
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
};

module.exports.update = async (req, res) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body.listing,
    },
    {
      runValidators: true,
      new: true,
    },
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }

  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found");
  }

  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};
