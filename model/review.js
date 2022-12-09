const mongoose = require('mongoose')

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
    }
})

const Review = new mongoose.model('Review', reviewSchema)
module.exports = Review;