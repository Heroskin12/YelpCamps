const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {reviewSchema} = require('../schemas.js');

// Middleware to check if review exists.
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, msg)
    } else {
        next();
    }
}

// Submit a new review.
router.post('/', validateReview, catchAsync(async (req, res) => {
    const review = new Review(req.body.review);
    const campground = await Campground.findById(req.params.id);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));



// Delete a review.
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
