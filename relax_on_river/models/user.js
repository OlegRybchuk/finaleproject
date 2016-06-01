mongoose = require('mongoose');
mongoose.set('debug', true);

var User = new mongoose.Schema({
    username: String,
    password: String
});

module.exports = mongoose.model('User', User);
