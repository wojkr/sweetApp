const mongoose = require('mongoose')
const User = require('./user')

const { Schema } = mongoose;

const reviewSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dessert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dessert'
    }
})

reviewSchema.post("findOneAndDelete", async (doc) => {
    if (doc) {
        await User.findByIdAndUpdate(doc.author, { $pull: { reviews: doc._id } })
    }
})

const Review = new mongoose.model('Review', reviewSchema)
module.exports = Review;