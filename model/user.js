const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
    minLength: 5
  },
  password: {
    type: String,
    require: true,
    minLength: 7
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  desserts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dessert'
  }],

});

userSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model("User", userSchema);
