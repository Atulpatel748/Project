// Import Express framework
const express = require("express");

// Create an Express application
const app = express();

// Import Mongoose to connect Node.js with MongoDB
const mongoose = require("mongoose");

// Import Listing model
const Listing = require("./models/listing");

// Import Node.js path module
const path = require("path");

// Import method-override to use PUT and DELETE requests from HTML forms
const methodOverride = require("method-override");

// Import EJS Mate for layout support in EJS
const ejsMate = require("ejs-mate");

// Utility function to handle asynchronous errors
const wrapAsync = require("./utils/wrapAsync.js");

// Custom Express error class
const ExpressError = require("./utils/ExpressError.js");

// Import Joi schemas for validating listing and review data
const { listingSchema, reviewSchema } = require("./schema.js");

// MongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// Import Review model
const Review = require("./models/review");

// Connect to MongoDB
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// Async function to establish MongoDB connection
async function main() {
  await mongoose.connect(MONGO_URL);
}

// -------------------- EXPRESS CONFIGURATION --------------------

// Set EJS as the template/view engine
app.set("view engine", "ejs");

// Tell Express where the EJS view files are located
app.set("views", path.join(__dirname, "views"));

// Middleware to parse data coming from HTML forms
// Example: req.body.listing
app.use(express.urlencoded({ extended: true }));

// Serve static files such as CSS, JavaScript and images
// from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Allows HTML forms to send PUT and DELETE requests
// Example: /listings/:id?_method=PUT
app.use(methodOverride("_method"));

// Use EJS Mate as the EJS engine
app.engine("ejs", ejsMate);

// -------------------- HOME ROUTE --------------------

// Home page
app.get("/", (req, res) => {
  res.send("Hi, I am Groot");
});

const validateListing = (req, res, next) => {
  // Validate the request body against the listingSchema
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// -------------------- LISTINGS ROUTES --------------------

// INDEX ROUTE
// GET /listings
// Fetch all listings and display them
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    // Find all documents from the listings collection
    const allListings = await Listing.find({});

    // Render the index.ejs page
    // and pass allListings to the view
    res.render("listings/index", { allListings });
  }),
);

// NEW ROUTE
// GET /listings/new
// Show the form for creating a new listing
app.get(
  "/listings/new",
  wrapAsync(async (req, res) => {
    // Render new.ejs
    res.render("listings/new");
  }),
);

// SHOW ROUTE
// GET /listings/:id
// Display a single listing
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    // Get the id from the URL
    let { id } = req.params;

    // Find the listing with this MongoDB ID and populate its reviews
    const listing = await Listing.findById(id).populate('reviews');

    // Render show.ejs and pass the listing
    res.render("listings/show", { listing });
  }),
);

// CREATE ROUTE
// POST /listings
// Create a new listing
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // Create a new Listing document using form data
    // req.body.listing contains the submitted form data
    const newListing = new Listing(req.body.listing);

    // Save the new listing to MongoDB
    await newListing.save();

    // Redirect to the listings page after successful creation
    res.redirect("/listings");
  }),
);

// EDIT ROUTE
// GET /listings/:id/edit
// Show the edit form for a listing
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    // Get listing ID from URL
    let { id } = req.params;

    // Find the listing in MongoDB
    const listing = await Listing.findById(id);

    // Render edit.ejs and pass the listing
    res.render("listings/edit", { listing });
  }),
);

// UPDATE ROUTE
// PUT /listings/:id
// Update an existing listing
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    // Get listing ID from URL
    let { id } = req.params;

    // Find the listing by ID and update it
    // The spread operator copies all fields from req.body.listing
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Redirect to the updated listing
    res.redirect(`/listings/${id}`);
  }),
);

// DELETE ROUTE
// DELETE /listings/:id
// Delete an existing listing
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    // Get listing ID from URL
    let { id } = req.params;

    // Find the listing by ID and delete it
    const deletedListing = await Listing.findByIdAndDelete(id);

    // Print the deleted document in the terminal
    console.log(deletedListing);

    // Redirect back to all listings
    res.redirect("/listings");
  }),
);

// -------------------- REVIEWS ROUTES --------------------

// CREATE REVIEW
// POST /listings/:id/reviews
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    // Get listing ID from URL
    const { id } = req.params;

    // Find the listing
    const listing = await Listing.findById(id);

    // Create a new Review document
    const review = new Review(req.body.review);

    // Save the review
    await review.save();

    // Add review reference to the listing
    listing.reviews.push(review);

    // Save updated listing
    await listing.save();

    // Redirect to listing page
    res.redirect(`/listings/${id}`);
  }),
);

// -------------------- TEST ROUTE --------------------

// This route was used to test whether
// we can insert a sample listing into MongoDB.

// app.get("/testListing", async (req, res) => {

//   // Create a new Listing document
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "by the beach",
//     price: 1200,
//     location: "Lucknow,U.P.",
//     country: "India",
//   });

//   // Save the document to MongoDB
//   await sampleListing.save();

//   // Print confirmation in terminal
//   console.log("sample was saved");

//   // Send response to browser
//   res.send("Successful testing");
// });

// -------------------- ERROR HANDLING MIDDLEWARE --------------------

// This route will catch all requests that don't match any of the above routes
// and will create a new ExpressError with a 404 status code
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

// This middleware handles errors passed using next(err)
// from routes or other middleware
app.use((err, req, res, next) => {
  // Send an error message to the browser
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message, err });
});

// -------------------- START SERVER --------------------

// Start Express server on port 8080
app.listen(8080, () => {
  // Print confirmation in terminal
  console.log("Server is listening to port 8080");
});
