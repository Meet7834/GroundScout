const User = require('../models/user');

module.exports.renderRegisterFormGet = (req, res) => {
    res.render('authorization/register.ejs', {title: 'Sign Up'});
};

module.exports.renderLoginFormGet = (req, res) => {
    res.render('authorization/login.ejs', {title: 'Login'})
};

module.exports.logOutGet = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', `Good Bye!`);
        res.redirect('/campgrounds');
    })
};

module.exports.createUserPost = async (req, res) => {
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
};

module.exports.loginUserPost = (req, res) => {
    req.flash('success', `Welcome Back ${req.user.username}!`);
    res.redirect('/campgrounds');
};