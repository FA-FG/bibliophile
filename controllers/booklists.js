const router = require('express').Router()

const axios = require('axios')

const List = require('../models/userbooklist.js')
const User = require('../models/user.js');
const Book = require('../models/book.js');


router.get('/booklist', async (req, res) => {
  res.render('books/booklist.ejs')
})




// Route to display the user's book list
// router.get('/booklist', async (req, res) => {
//   const userId = req.session.user._id;  // Get the userId from the session
// })


// Route to retrieve and display the user's book list
router.get('/booklist', async (req, res) => {
  const userId = req.session.user._id;  // Retrieve the logged-in user's ID from the session

  try {
    // Query Userbooklist to get the books associated with the logged-in user
    const userBooks = await Userbooklist.find({ user: userId })
      .populate('bookName')  // Populate the `bookName` field with full book details
      .exec();

    // Extract the book details from the populated `bookName` field
    const books = userBooks.map(userBook => userBook.bookName);

    // Render the `booklist.ejs` page and pass the books to it
    res.render('books/booklist.ejs', { books });
  } catch (error) {
    console.error('Error retrieving user books:', error);
    res.status(500).send('Error retrieving books');
  }
});









// // Route to display the list of books for a specific user
// router.get('/booklist', async (req, res) => {
//   const userId = req.session.user._Id;  // Get the user ID from the URL parameter

//   try {
//     // Retrieve the user's book list and populate the book details from the Book collection
//     const userBooks = await List.find({ user: userId })
//       .populate('bookName')  // Populate the `bookName` field with book details
//       .exec();

//     // Extract the book details from the populated results
//     const books = userBooks.map(userBook => userBook.bookName);

//     // Render the 'booklist.ejs' page and pass the books array
//     res.render('booklists/booklist', { books: books });
//   } catch (error) {
//     console.error('Error retrieving books:', error);
//     res.status(500).send('Error retrieving books');
//   }
// });
















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



