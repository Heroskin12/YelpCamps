// List of External Dependencies
const {campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const engine = require('ejs-mate');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const Campground = require('./models/campground');
const Review = require('./models/review.js')
const ExpressError = require('./utils/ExpressError');

// Open the database connection.
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Log error if db fails to connect.
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

// Instantiate current express app.
const app = express();

// Allows app to inject ejs into HTML.
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Tells app to look for HTML in views directory.
app.set('views', path.join(__dirname, 'views'));

// App will use each of these 3 before any request on the site.

// For processing form data.
app.use(express.urlencoded({extended: true}));

// To force change any post methods to DELETE or PATCH where necessary.
app.use(methodOverride('_method'));

// Providing more detail on HTTP requests in the console.
app.use(morgan('common'));

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

// Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// Index of all campgrounds.
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

// Add a new campground.
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// Submit a new campground.
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`); 
}));

// Submit a new review.
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const review = new Review(req.body.review);
    const campground = await Campground.findById(req.params.id);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Edit a campground.
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp})
}));

// Delete a campground.
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');    
}));

// Delete a review.
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// Get an individual campground.
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    console.log(campground);
    res.render('campgrounds/show', {campground})
}));

// Submit a campground edit.
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true, new: true});
    console.log(camp);
    res.redirect(`/campgrounds/${id}`);
}));

// If the app wasn't using any of the above valid routes, then throw an 404 page not found error.
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'))
})

// Renders the error page with info sent from the app.all route.
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh no! Something went wrong!"
    res.status(statusCode).render('error', {err});
});

// Confirmation that the backend is working.
app.listen(3000, () => {
    console.log("Listening on port 3000!");
});

