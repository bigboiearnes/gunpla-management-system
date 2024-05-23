const mongoose = require('mongoose');

const usersReviewedSchema = new mongoose.Schema ({
  username: String,
  reviewLikes: [String],
  reviewDislikes: [String]
})

const kitSchema = new mongoose.Schema({
  id: String, 
  kitId: String,
  kitName: String,
  kitGrade: String,
  gundamModel: String,
  runnerNum: Number,
  releaseYear: Number,
  releaseMonth: Number,
  boxArt: String,
  scale: String,
  accessories: [String], 
  biography: String,
  timeline: String,
  usersReviewed: [usersReviewedSchema],
  userTags: [{
    tag: String,
    username: String
  }],
  userScore: Number
});

module.exports = mongoose.model('Kit', kitSchema, 'gmskits');