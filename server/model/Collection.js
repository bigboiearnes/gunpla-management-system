const mongoose = require('mongoose');

const collectionItemSchema = new mongoose.Schema({
  kitId: String,
  status: String, 
  rating: Number, //1-5
  review: String,
  image: String, // URL pointing to image of user build
  uploadDate: Date
});

const userCollectionSchema = new mongoose.Schema({
    username: String,
    collection: [collectionItemSchema]
});

module.exports = mongoose.model('Collection', userCollectionSchema, 'gmscollection');