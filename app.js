// List of External Dependencies
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const engine = require('ejs-mate');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbURL = process.env.DB_URL;
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo');

// To avoid deprecation warnings.
mongoose.set('strictQuery', true);
// Open the database connection.
mongoose.connect(dbURL, {
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

// Sanitizes any mongo to prevent injection.
app.use(mongoSanitize());



// Runs all of helmet middleware.
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
  ];
  const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/", // I had to add this item to the array
  ];
  const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
  ];
  const fontSrcUrls = ["https://res.cloudinary.com/dzodcoe0t/"];
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    })
  );

// COnfigure the session cookie.
const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24*60*60,
    crypto: {
        secret: 'NQq.7[eAp:)7vCuy'
    }
});
store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
})
const sessionConfig ={
    name: 'session',
    secret: 'wQfqMD/@`-28VV>8',
    store,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // To disable client side scripts accessing session cookie.
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

// Enable flashing messages.
app.use(flash());

// Configuring login system.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

// How to store and unstore User in session.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Providing more detail on HTTP requests in the console.
app.use(morgan('common'));

// These can be accessed from any template.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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

