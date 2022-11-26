const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require("../schemas");
const Campground = require("../models/campground");
const Review = require('../models/review');

//Middlewares:
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
        // console.log(results);
    } else {
        next();
    }
}

//Post Requests:
router.post('/', validateReview, catchAsync(async (req, res) => {
    const { content, rating } = req.body;
    const newReview = new Review({ content, rating });
    const camp = await Campground.findById(req.params.id);
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    // console.log(newReview);
    // res.render('campgrounds/details', {camp, title: camp.title});
    req.flash('success', 'Created New Review!'); 
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//Delete Routes:

router.delete('/:reviewID', catchAsync(async (req, res) => {
    const { id, reviewID } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Deleted the Review!'); 
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;