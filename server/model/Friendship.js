const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', immutable: false }});
module.exports = mongoose.model('Friendship', friendshipSchema, 'gmsfriends');
