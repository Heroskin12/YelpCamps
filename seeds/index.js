if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {places, descriptors} = require('./seedHelpers')
const cities = require('./cities');
const axios = require('axios');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImg(random10) {
    try {
        const res = await axios.get('https://api.pexels.com/v1/search', {
            headers: {
                Accept: "application/json",
                Authorization: `${process.env.PEXEL_API_KEY}`
            },
            params: {
                query: 'camping',
                orientation: 'landscape',
                size: 'medium'
            }

        })
        // console.log(res.data.photos[random10].src.original);
        return res.data.photos[random10].src.original;
    }
    catch(err) {
        console.log(err);
    }
}

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 5; i++) {
        const price = Math.floor(Math.random()*20)+10;
        const random1000 = Math.floor(Math.random()*1000);
        const random10 = Math.floor(Math.random()*10);
        
    
        const camp = new Campground({
            author: '63f687df695ee5c1d6397f40',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dicta, at suscipit! Tempora suscipit, iure assumenda enim nulla similique provident in!',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dz2riml2t/image/upload/v1677095170/YelpCamp/p44ua4vfktw7fmcyerx6.jpg',
                  filename: 'YelpCamp/p44ua4vfktw7fmcyerx6'
                },
                {
                  url: 'https://res.cloudinary.com/dz2riml2t/image/upload/v1677095170/YelpCamp/yi7mh0wucttboteuourq.jpg',
                  filename: 'YelpCamp/yi7mh0wucttboteuourq'
                }
              ]
            
        })
        await camp.save(); 
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});