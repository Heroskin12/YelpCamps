const Campground = require('../models/campground');
const {cloudinary} = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`); 
}

module.exports.showCampground = async (req, res) => {
    const {id} = req.params;
    // This populates the review, its author and the author of the camp.
    const campground = await Campground.findById(id).populate({
        path:'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author');
    
    if(!campground) {
        req.flash('error', "Sorry, we can't find that campground!");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground})
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', "Sorry, we can't find that campground!");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground})
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true, new: true});
    if(!campground) {
        req.flash('error', "Sorry, that campground does not exist!");
        res.redirect('/campgrounds');
    }
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');    
}