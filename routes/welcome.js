var express = require('express');
var app = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('welcome', { title: 'Welcome' });
});

function toggleSignin() {
  alert('button click called');
}

module.exports = router;
