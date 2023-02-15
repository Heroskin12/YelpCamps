const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const campground = require('./models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/makecampground', async (req, res) => {
    const camp = new campground({title: 'My Backyard', price: 50, description: "Cheap camping!", location: "Swansea"});
    await camp.save();
    res.send(camp);
})
app.listen(3000, () => {
    console.log("Listening on port 3000!");
})