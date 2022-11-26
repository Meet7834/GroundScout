// Requiring Modules:
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const { join } = require("path");
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const session = require('express-session');
const flash = require('connect-flash');

// Setting utilities:
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Engines:
app.engine('ejs', ejsMate);

// Setting Up Middlewares:
app.use(urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'public')));

//Configuring Session: 
const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Starting Mongoose Server:
mongoose.connect("mongodb://127.0.0.1:27017/YelpCamp", { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on('error', console.error.bind(console, "MONGO SERVER ERROR!"));
mongoose.connection.once('open', () => {
    console.log("MONGO SERVER CONNECTED!");
})

//Setting Up Routes:
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Get requests:
app.get("/", (req, res) => {
    res.render("home", { title: 'Home Page' });
})

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