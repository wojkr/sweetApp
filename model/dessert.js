const mongoose = require("mongoose");
const Review = require('./review')

const imageSchema= new mongoose.Schema({
  
    url:String,
    filename: String
  }
);
imageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload','/upload/w_100');
})

const dessertSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  dsc: {
    type: String,
  },
  imgs: [imageSchema],
  country: {
    type: String,
  },
  company: {
    type: String,
  },
  price: {
    type: Number,
  },
  rate: {
    type: Number,
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

dessertSchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } })
  }
})

const Dessert = mongoose.model("Dessert", dessertSchema);
module.exports = Dessert;

// const dessertSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "name cannot be blanc"],
//   },
//   dsc: {
//     type: String,
//     required: [true, "Description cannot be blanc"],
//   },
//   img: {
//     type: String,
//   },
//   country: {
//     type: String,
//     required: [true, "Country cannot be blanc"],
//   },
//   company: {
//     type: String,
//     required: [true, "Company cannot be blanc"],
//   },
//   price: {
//     type: Number,
//     required: [true, "Price cannot be blanc"],
//     min: 0,
//   },
//   rate: {
//     type: Number,
//     required: [true, "Rate cannot be blanc"],
//     min: 0,
//   },
// });
