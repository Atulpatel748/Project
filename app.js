// Application entry point and route definitions

const express = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");

const app = express();

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// --------------------------------------------------
// Connect to MongoDB
// --------------------------------------------------

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// --------------------------------------------------
// Express Configuration
// --------------------------------------------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

// --------------------------------------------------
// Home Route
// --------------------------------------------------

app.get("/", (req, res) => {
  res.send("Hi, I am Groot");
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

// Listing routes
app.use("/listings", listingRouter);

// Review routes
app.use("/listings", reviewRouter);

// --------------------------------------------------
// Global 404 Handler
// --------------------------------------------------

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).render("error.ejs", {
    message,
    err,
  });
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(3000, () => {
  console.log("Server is listening to port 3000");
});
