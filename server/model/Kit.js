const mongoose = require('mongoose');

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
  biography: String
});

module.exports = mongoose.model('Kit', kitSchema, 'gmskits');