const router = require('express').Router()

const axios = require('axios')

const List = require('../models/userbooklist.js')
const User = require('../models/user.js');
const Book = require('../models/book.js');



// router.get('/', async (req, res) => {
//   res.render('books/index.ejs')
// })

// router.get('/booklist', async (req, res) => {
//   const book = await List.find()
//   res.render('books/booklist.ejs',{List})
// })

// router.get('/booklist', async (req, res) => {
//   try {
//       const books = await List.find().populate('bookName user');
//       res.render('booklist', { books });
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Error retrieving book list');
//   }
// });
// // Route to add a new book to the list
// router.post('/booklist/add', async (req, res) => {
//   const { title, rating, image, id } = req.body;

//   try {
//       const newBook = new List({
//           bookName: title,
//           rating: rating,
//           image: image,
//           bookId: id,
//           // user: req.user // Assuming you have user authentication and req.user contains the user information
//       });
// // Redirect back to the booklist page after adding the book
//       await newBook.save();
//       res.redirect('/booklist'); 
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Error adding new book to list');
//   }
// });

router.get('/booklist', async (req, res) => {
  res.render('books/booklist.ejs')
})

module.exports = router;



