const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReviewPost = async (req, res) => {
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
}

module.exports.deleteReviewDelete = async (req, res) => {
    const { id, reviewID } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Deleted the Review!'); 
    res.redirect(`/campgrounds/${id}`)
}