const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

//Get Routes
router.get('/', catchAsync(async (req, res) => {
    const allCamps = await Campground.find({}).populate('author');
    res.render('campgrounds/index.ejs', { allCamps, title: 'All Campgrounds' });
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs', { title: 'Create A Campground' });
})

router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({path:'reviews', populate: 'author'}).populate('author');
    if(!camp){
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    }else{
        res.render('campgrounds/details.ejs', { camp, title: camp.title });
    }
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { camp, title: "Edit Campground" })
}))

// Post Routes: 
router.post('/new', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { title, location, image, price, description } = req.body;
    const newCamp = await Campground({ title: title, location: location, image: image, price: price, description: description });
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log("Added to Database");
    req.flash('success', 'Successfully made a new Campground!'); 
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

//Patch Routes:
router.patch('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, location, price, description, image } = req.body;
    await Campground.findByIdAndUpdate(id, { title, location, price, description, image });
    console.log("Database Updated");
    req.flash('success', 'Successfully updated the Campground!'); 
    res.redirect(`/campgrounds/${id}`);
}))

//Delete Routes:
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("Deleted from Database");
    req.flash('success', 'Successfully deleted the Campground!'); 
    res.redirect('/campgrounds/');
}))

module.exports = router;