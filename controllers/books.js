const router = require('express').Router()


const User = require('../models/user.js');
const Book = require('../models/book.js');
// const Userbooklist = require('../models/userbooklist.js')


router.get('/', async (req, res) => {
  res.render('books/index.ejs');
})

router.get('/book-page', async (req, res)=>{
  res.render('books/book-page.ejs')
})



// router.get('/', async (req, res) => { 
//   // const recipes = await Book.find().populate('owner');
//   res.render('books/index.ejs', { books });
// });




module.exports = router;