const mongoose = require("mongoose");
const Review = require('./review')
const options = { toJSON: { virtuals: true } }

const imageSchema = new mongoose.Schema({
  url: String,
  filename: String
}
);
imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_100');
})

const dessertSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  dsc: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  author_name: { type: String },
  imgs: [imageSchema],
  country: {
    type: String,
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
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
}, options);

dessertSchema.virtual('properties.popUpMarkup').get(function () {
  return `${this.company} <br> <i>${this.name}</i>`
})

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
