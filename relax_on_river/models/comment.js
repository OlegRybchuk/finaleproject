var mongoose = require('mongoose');
mongoose.set('debug', true);

var Comment = new mongoose.Schema({
      user: {type: mongoose.Schema.ObjectId, ref: 'User'}
    , post: {type: mongoose.Schema.ObjectId, ref: 'Post'}
    , text: String
    , date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', Comment);

