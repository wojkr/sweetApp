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
    }
})

const Review = new mongoose.model('Review', reviewSchema)
module.exports = Review;