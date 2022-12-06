const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const controller = require('../controllers/reviewController');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

// Post Requests:
router.post('/', isLoggedIn, validateReview, catchAsync(controller.createReviewPost));

// Delete Routes:
router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(controller.deleteReviewDelete));

module.exports = router;