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
