if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

// Requiring Modules:
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const { urlencoded } = require("express");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const morgan = require('morgan');
const { join } = require("path");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const MongoDBStore = require('connect-mongo')(session);

// const dbUrl = process.env.DB_URL;
const dbUrl = "mongodb://127.0.0.1:27017/YelpCamp";

//Routes:
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authorizationRoutes = require('./routes/authrization');

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
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisisasecret';
const store = new MongoDBStore({
    url:dbUrl, 
    secret,
    touchAfter: 24*60*60
});

store.on('error',(e)=>{
    console.log('An error occured in the session', e);
})

//Configuring Session: 
const sessionConfig = {
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//Session:
app.use(session(sessionConfig));
app.use(flash());
app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
}));

//Passport:
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
// Starting Mongoose Server:
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on('error', console.error.bind(console, "MONGO SERVER ERROR!"));
mongoose.connection.once('open', () => {
    console.log("MONGO SERVER CONNECTED!");
})

//Setting Up Routes:
app.use('/', authorizationRoutes);
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
const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
    console.log(`Listening on port ${port}`);
})