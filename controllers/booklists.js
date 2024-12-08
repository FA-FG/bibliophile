const router = require('express').Router()

const axios = require('axios')

const List = require('../models/userbooklist.js')
const User = require('../models/user.js');
const Book = require('../models/book.js');


// Route to display the list of books for a specific user
router.get('/:Id', async (req, res) => {
  const userId = req.params.userId;  // Get the user ID from the URL parameter

  try {
    // Retrieve the user's book list and populate the book details from the Book collection
    const userBooks = await List.find({ user: userId })
      .populate('bookName')  // Populate the `bookName` field with book details
      .exec();

    // Extract the book details from the populated results
    const books = userBooks.map(userBook => userBook.bookName);

    // Render the 'booklist.ejs' page and pass the books array
    res.render('booklist', { books: books });
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).send('Error retrieving books');
  }
});




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


module.exports = router;



