const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware.js')

// Middleware to check if campground exists.
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg)
    } else {
        next();
    }
}


// Index of all campgrounds.
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

// Add a new campground.
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// Submit a new campground.
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`); 
}));

// Edit a campground.
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if(!camp) {
        req.flash('error', "Sorry, we can't find that campground!");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {camp})
}));

// Delete a campground.
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');    
}));

// Get an individual campground.
router.get('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground) {
        req.flash('error', "Sorry, we can't find that campground!");
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground})
}));

// Submit a campground edit.
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true, new: true});
    if(!camp) {
        req.flash('error', "Sorry, that campground does not exist!");
        res.redirect('/campgrounds');
    }
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;