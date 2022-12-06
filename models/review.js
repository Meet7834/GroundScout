const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: String,
    rating:{
        type: Number,
        required: true,
        min: 0,
        max: 5
    }
})

module.exports = mongoose.model('Review', reviewSchema);