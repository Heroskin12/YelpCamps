const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
    console.log(doc)
})
module.exports = mongoose.model('Campground', CampgroundSchema);