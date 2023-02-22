const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware');
const reviews = require('../controllers/reviews');

// Submit a new review.
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete a review.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
