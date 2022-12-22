const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geoCoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.allCampsGet = async (req, res) => {
    const allCamps = await Campground.find({}).populate('author');
    res.render('campgrounds/index.ejs', { allCamps, title: 'All Campgrounds' });
};

module.exports.renderCreateCampGet = (req, res) => {
    res.render('campgrounds/new.ejs', { title: 'Create A Campground' });
};

module.exports.renderCampGet = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({ path: 'reviews', populate: 'author' }).populate('author');
    if (!camp) {
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    } else {
        res.render('campgrounds/details.ejs', { camp, title: camp.title });
    }
};

module.exports.renderEditCampGet = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { camp, title: "Edit Campground" })
};

module.exports.createCampPost = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    const { title, location, image, price, description } = req.body;
    const newCamp = await Campground({ title: title, location: location, image: image, price: price, description: description });
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.editCampPatch = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    const { id } = req.params;
    const { title, location, price, description } = req.body;
    await Campground.findByIdAndUpdate(id, { title, location, price, description });
    editCamp = await Campground.findById(id);
    const img = req.files.map(file => ({ url: file.path, filename: file.filename }));
    editCamp.images.push(...img);
    editCamp.geometry = geoData.body.features[0].geometry;
    await editCamp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await editCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log("Database Updated");
    req.flash('success', 'Successfully updated the Campground!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampDelete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("Deleted from Database");
    req.flash('success', 'Successfully deleted the Campground!');
    res.redirect('/campgrounds/');
};