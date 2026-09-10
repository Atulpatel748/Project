const express = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");

const util = require("util");
if (util.isArray !== Array.isArray) {
  util.isArray = Array.isArray;
}

const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// DB
main().then(() => console.log("connected to DB")).catch(console.log);
async function main() {
  await mongoose.connect(MONGO_URL);
}

// App config
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};


app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Home
app.get("/", (req, res) => res.send("Hi, I am Groot"));

// app.get("/fakeUser", async (req, res) => {
//   const user = new User({ email: "fake@example.com", username: "demoUser" });
//   let registeredUser = await User.register(user, "hello world"); // Register the user with a password
//   res.send("Fake user created!");
// });

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// --------------------------------------------------
// Global 404 Handler
// --------------------------------------------------

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  console.error(err);
  res.status(statusCode).render("error.ejs", { message, err });
});

// Start
app.listen(3000, () => console.log("Server listening on port 3000"));
