// Requiring Modules:
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const Campground = require("./models/campground");
const Review = require('./models/review')
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Joi = require('joi');
const { join } = require("path");
const {campgroundSchema, reviewSchema} = require("./schemas");

// Setting utilities:
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Engines:
app.engine('ejs', ejsMate);

// Setting Up Middlewares:
app.use(urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan('tiny'));

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

const validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
        // console.log(results);
    }else{
        next();
    }
}

// Starting Mongoose Server:
mongoose.connect("mongodb://127.0.0.1:27017/YelpCamp", { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on('error', console.error.bind(console, "MONGO SERVER ERROR!"));
mongoose.connection.once('open', () => {
    console.log("MONGO SERVER CONNECTED!");
})

// Get requests:
app.get("/", (req, res) => {
    res.render("home", { title: 'Home Page' });
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const allCamps = await Campground.find({});
    res.render('campgrounds/index.ejs', { allCamps, title: 'All Campgrounds' });
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs', { title: 'Create A Campground' });
})

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/details.ejs', { camp, title: camp.title });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit.ejs', { camp, title: "Edit Campground" })
}))

//Post Requests:
app.post('/campgrounds/new', validateCampground, catchAsync(async (req, res, next) => {
    const { title, location, image, price, description } = req.body;
    const newCamp = await Campground({ title: title, location: location, image: image, price: price, description: description });
    await newCamp.save();
    console.log("Added to Database");
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

app.post('/campgrounds/:id/review', validateReview , catchAsync(async(req,res)=>{
    const {content, rating} = req.body;
    const newReview = new Review({content, rating});
    const camp = await Campground.findById(req.params.id);
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    // console.log(newReview);
    // res.render('campgrounds/details', {camp, title: camp.title});
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//Patch Requests:
app.patch('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, location, price, description, image } = req.body;
    await Campground.findByIdAndUpdate(id, { title, location, price, description, image });
    console.log("Database Updated");
    res.redirect(`/campgrounds/${id}`);
}))

//Delete Requests:
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("Deleted from Database");
    res.redirect('/campgrounds/');
}))

app.delete('/campgrounds/:id/reviews/:reviewID', catchAsync(async(req,res)=>{
    const {id, reviewID} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`)
}))

//Error Handling:
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong';
    res.status(statusCode).render('error.ejs', { err, title: 'Error', statusCode });
})

// Running Server:
app.listen(3000, (req, res) => {
    console.log("Listening on port 3000!");
})