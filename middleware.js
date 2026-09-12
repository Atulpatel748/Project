const Listing = require('./models/listing');

module.exports.isLoggedIn = (req, res, next) => {
  console.log("REQ.USER...", req.user);
  if (!req.isAuthenticated()) {
    req.session.redirectTo = req.originalUrl;
    req.flash("error", "You must be signed in to create a new listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveReturnTo = (req, res, next) => {
  if (req.session.redirectTo) {
    res.locals.redirectTo = req.session.redirectTo;
  }
  next();
};

module.exports.isListingOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to modify this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
