const router = require('express').Router()

// const User = require('../models/user.js');
const Book = require('../models/book.js');
// const Userbooklist = require('../models/userbooklist.js')


router.get('/', async (req, res) => {
  res.render('books/index.ejs');
});

module.exports = router;