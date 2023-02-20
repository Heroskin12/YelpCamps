// List of External Dependencies
const engine = require('ejs-mate');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash')

// To avoid deprecation warnings.
mongoose.set('strictQuery', true);

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

//Tells the app where the public files are.
app.use(express.static(path.join(__dirname, 'public')));

// COnfigure the session cookie.
const sessionConfig ={
    secret: 'badsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // To disable client side scripts accessing session cookie.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// Enable flashing messages.
app.use(flash());

// Providing more detail on HTTP requests in the console.
app.use(morgan('common'));

// Middleware for accessing flashed messages before any request.
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// Home Page
app.get('/', (req, res) => {
    res.render('index');
});

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

