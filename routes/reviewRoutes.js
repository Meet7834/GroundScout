const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//Post Requests:
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { content, rating } = req.body;
    const newReview = new Review({ content, rating });
    const camp = await Campground.findById(req.params.id);
    newReview.author = req.user._id;
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    // console.log(newReview);
    // res.render('campgrounds/details', {camp, title: camp.title});
    req.flash('success', 'Created New Review!'); 
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//Delete Routes:

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewID } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Deleted the Review!'); 
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;