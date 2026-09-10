const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const LocalMongoosePlugin = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new Schema({
  email: {
   type: String,
   required: true,
   unique: true,
  },
});

userSchema.plugin(LocalMongoosePlugin);

module.exports = mongoose.model('User', userSchema);