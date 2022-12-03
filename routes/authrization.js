const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

// Get Routes:
router.get('/register', (req, res) => {
    res.render('authorization/register.ejs', {title: 'Sign Up'});
});

router.get('/login', (req, res) => {
    res.render('authorization/login.ejs', {title: 'Login'})
})

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', `Good Bye!`);
        res.redirect('/campgrounds');
    })
})

// Post Routes:
router.post('/register', catchAsync(async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err)=>{
            if (err) return next(err);
            req.flash('success', `Welcome to YelpCamp: ${registeredUser.username}!`);
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.post('/login', passport.authenticate('local', {failureFlash: true,failureRedirect: '/login'}), (req, res) => {
    req.flash('success', `Welcome Back ${req.user.username}!`);
    res.redirect('/campgrounds');
})

module.exports = router;
