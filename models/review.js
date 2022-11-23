const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    content: String,
    rating:{
        type: Number,
        required: true,
        min: 0,
        max: 5
    }
})

module.exports = mongoose.model('Review', reviewSchema);