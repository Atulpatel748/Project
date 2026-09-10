const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// DB
main().then(() => console.log("connected to DB")).catch(console.error);

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Seed
const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.info("data was initialized");
};

initDB();