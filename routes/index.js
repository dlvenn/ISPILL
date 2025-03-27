var express = require('express');
const connection = require('../library/database');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  connection.query('SELECT * FROM posts ORDER BY jd DESC', function (err, rows) {
    if (err) {
      req.flash('error', err);
      //res.render('posts/index', { data: ''});
      res.render('index', { title: 'Express',  data: '' });
  } else {
      res.render('index', { title: 'Express',  data: rows });
      //res.render('posts/index', { data: rows });
  }
});
  //res.render('index', { title: 'Express' });
});

module.exports = router;
