const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: { type: String, required: true },
    registerDate: Date,
    biography: String,
    profilePicture: String
});

module.exports = mongoose.model('User', userSchema, 'gmsusers');