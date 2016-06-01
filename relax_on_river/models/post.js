mongoose = require('mongoose');
mongoose.set('debug', true);

var Post = new mongoose.Schema({
      user: {type: mongoose.Schema.ObjectId, ref: 'User'}
    , name: String
    , description: String
    , image: String
});

module.exports = mongoose.model('Post', Post);
