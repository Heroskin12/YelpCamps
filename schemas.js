// External Dependency
const Joi = require('joi');

// Use JOI to tell the app how each piece of form data should be validated. More to be added.
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        //image: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})