const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema} = require("../schemas");
const Campground = require("../models/campground");
const isLoggedIn = require('../middleware');

//Middlewares:
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
        // console.log(results);
    }else{
        next();
    }
}

//Get Routes
router.get('/', catchAsync(async (req, res) => {
    const allCamps = await Campground.find({});
    res.render('campgrounds/index.ejs', { allCamps, title: 'All Campgrounds' });
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs', { title: 'Create A Campground' });
})

router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    if(!camp){
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    }else{
        res.render('campgrounds/details.ejs', { camp, title: camp.title });
    }
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
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
    await newCamp.save();
    console.log("Added to Database");
    req.flash('success', 'Successfully made a new Campground!'); 
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

//Patch Routes:
router.patch('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, location, price, description, image } = req.body;
    await Campground.findByIdAndUpdate(id, { title, location, price, description, image });
    console.log("Database Updated");
    req.flash('success', 'Successfully updated the Campground!'); 
    res.redirect(`/campgrounds/${id}`);
}))

//Delete Routes:
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("Deleted from Database");
    req.flash('success', 'Successfully deleted the Campground!'); 
    res.redirect('/campgrounds/');
}))

module.exports = router;