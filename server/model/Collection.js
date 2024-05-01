const mongoose = require('mongoose');

const collectionItemSchema = new mongoose.Schema({
  kitId: String,
  status: String, //built, owned, or wishlisted.
  rating: Number, //1-5
  review: String
});

const userCollectionSchema = new mongoose.Schema({
    username: String,
    collection: [collectionItemSchema]
});

module.exports = mongoose.model('Collection', userCollectionSchema, 'gmscollection');