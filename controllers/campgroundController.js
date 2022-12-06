const Campground = require("../models/campground");

module.exports.allCampsGet = async (req, res) => {
    const allCamps = await Campground.find({}).populate('author');
    res.render('campgrounds/index.ejs', {allCamps, title: 'All Campgrounds'});
};

module.exports.renderCreateCampGet = (req, res) => {
    res.render('campgrounds/new.ejs', { title: 'Create A Campground' });
};

module.exports.renderCampGet = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({path:'reviews', populate: 'author'}).populate('author');
    if(!camp){
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    }else{
        res.render('campgrounds/details.ejs', { camp, title: camp.title });
    }
};

module.exports.renderEditCampGet = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', "I am sorry, We can't find the campground");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { camp, title: "Edit Campground" })
};

module.exports.createCampPost = async (req, res, next) => {
    const { title, location, image, price, description } = req.body;
    const newCamp = await Campground({ title: title, location: location, image: image, price: price, description: description });
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log("Added to Database");
    req.flash('success', 'Successfully made a new Campground!'); 
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.editCampPatch = async (req, res) => {
    const { id } = req.params;
    const { title, location, price, description, image } = req.body;
    await Campground.findByIdAndUpdate(id, { title, location, price, description, image });
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