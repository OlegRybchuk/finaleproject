var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Comment = require('../models/comment');
var passport = require('passport');
var multer  = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  }
  ,filename: function (req, file, cb) {
    var date = Date.now();
    cb(null, date + file.originalname)
  }
});
var upload = multer({storage: storage});

var isAuthenticated = function(req, res, next){
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
};

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = {};
  if (req.isAuthenticated()){
    data.user = req.user
  }
  Post.find({}, function(err, posts){
    data.posts = posts;
    res.render('index', data);
  }).populate('user') ;
});

router.get('/contact/', function(req, res, next) {
  var data = {};
  if (req.isAuthenticated()){
    data.user = req.user
  }
  Post.find({}, function(err, posts){
    data.posts = posts;
    res.render('contact', data);
  }).populate('user') ;
});

router.get('/about/', function(req, res, next){
  res.redirect('https://uk.wikipedia.org/wiki/%D0%9F%D1%96%D0%B2%D0%B4%D0%B5%D0%BD%D0%BD%D0%B8%D0%B9_%D0%91%D1%83%D0%B3');
});

router.get('/news/', function(req, res, next) {
  var data = {};
  if (req.isAuthenticated()){
    data.user = req.user
  }
  Post.find({}, function(err, posts){
    data.posts = posts;
    res.render('news', data);
  }).populate('user') ;
});

router.get('/register/', function(req, res, next){
  User.find({}, function(err, obj){
    res.render('register');
  });
});

router.post('/register/', function(req, res, next){
  User.findOne({username: req.body.username}, function(err, obj){
    if (obj){
      res.render('register', {error: 'User already exist'});
    } else {
      var user = new User({username: req.body.username, password: req.body.password});
      user.save(function (err) {
        if (err) return console.log(err);
        // saved!
      });
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    }
  });
});

router.get('/login/', function(req, res, next){
  res.render('login');
});

router.post('/login/', function(req, res, next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {

      return res.render('index', {login_error: 'user not exist'});
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout/', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/post/:post_id', function(req, res, next){
  Post.findOne({_id: req.params.post_id}, function(err, obj){
    if (obj){
      Comment.find({post: obj._id}, function(err, comments){
        res.render('post', {user: req.user, post: obj, comments:comments})
      }).populate('user');
    } else {
      res.send('page not found', 404)
    }
  }).populate('user');

});

router.get('/post-add/', isAuthenticated, function(req, res, next){
  res.render('post_add', {user: req.user})
});

router.post('/post-add/', upload.single('image'), function(req, res, next){
  if (req.isAuthenticated()){
    var data = {
      'user': req.user._id
      , 'name': req.body.name
      , 'description': req.body.description
    };
    if (req.file){
      data.image = req.file.path
    }
    var post = new Post(data);
    post.save(function(err){
      if (err){console.log(err)}
    });
    res.redirect('/')
  } else {
    res.redirect('/')
  }
});

router.get('/post-edit/:post_id', isAuthenticated, function(req, res, next){
  Post.findOne({_id: req.params.post_id}, function(err, obj){
    if (obj && obj.user.username == req.user.username){
      res.render('post_add', {user: req.user, post: obj, edit:true});
    } else {
      res.send('not found', 404)
    }
  }).populate('user')
});

router.post('/post-edit/:post_id', isAuthenticated, upload.single('image'), function(req, res, next){
  Post.findOne({_id: req.params.post_id}, function(err, obj){
    if (obj && obj.user.username == req.user.username){
      console.log(req.body);
      obj.name = req.body.name;
      obj.description = req.body.description;
      if (req.file){
        obj.image = req.file.path;
      }
      obj.save();
      res.redirect('/post/' + obj._id);
    }
  }).populate('user')
});

router.post('/post/:post_id/add-comment/', isAuthenticated, function(req, res, next){
  Post.findById(req.params.post_id, function(err, obj){
    var comment = Comment({
        text: req.body.text
      , user: req.user._id
      , post: obj._id
    });
    comment.save();
    res.redirect('/post/' + obj._id);
  }).populate('user');

});

router.post('/post/:post_id/delete/', isAuthenticated, function(req, res, next){
  Post.findById(req.params.post_id, function(err, post){
    Comment.remove({post: post._id}, function(err){
      post.remove(function(err){
        res.redirect('/')
      });
    })
  })
});

module.exports = router;
