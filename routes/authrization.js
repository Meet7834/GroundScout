const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const controller = require('../controllers/userController');

// Grouped Routes:
router.route('/register')
    .get(controller.renderRegisterFormGet)
    .post(catchAsync(controller.createUserPost))

router.route('/login')
    .get(controller.renderLoginFormGet)
    .post(passport.authenticate('local', {failureFlash: true,failureRedirect: '/login'}), controller.loginUserPost)
    
//Standalone Routes:
router.get('/logout', controller.logOutGet);

module.exports = router;
