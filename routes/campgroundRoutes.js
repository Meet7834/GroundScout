const express = require('express');
const router = express.Router();
const controller = require('../controllers/campgroundController');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary/index');
const upload = multer({storage});

//Grouped Routes
router.route('/new')
    .get(isLoggedIn, controller.renderCreateCampGet)
    .post(isLoggedIn,  upload.array('image'), validateCampground, catchAsync(controller.createCampPost))

router.route('/:id')
    .get(catchAsync(controller.renderCampGet))
    .patch(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(controller.editCampPatch))
    .delete(isLoggedIn, isAuthor, catchAsync(controller.deleteCampDelete))

//Standalone routes:
router.get('/', catchAsync(controller.allCampsGet));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(controller.renderEditCampGet));

module.exports = router;