const express = require('express');
const router = express.Router();
const Book = require('../models/book');  // Your Book model
const axios = require('axios')
const Userbooklist = require('../models/userbooklist');  // Your Userbooklist model



// Render the user's booklist page
router.get('/booklist', async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Find the user's booklist
    const userBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');

    if (!userBookList || !userBookList.bookName.length) {
      return res.render('books/booklist.ejs', { books: [] }); // If no books, send an empty array
    }

    // Get the book details from the populated bookName field
    const books = userBookList.bookName.map(book => ({
      name: book.name,
      image: book.image,
      status: userBookList.readingStatus, // Assuming the status is the same for all books in the list
      _id: book._id,
    }));

    res.render('books/booklist.ejs', { books });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching book list');
  }
});

// Route to handle individual book details (optional)
router.get('/show/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).send('Book not found');
    }

    res.render('books/show.ejs', { book });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching book details');
  }
});

// Search books by name or author
router.post('/book-page', async (req, res) => {
  const search = req.body.search;

  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${search}&startIndex=0&maxResults=40&key=YOUR_GOOGLE_API_KEY`);
    const booksData = response.data.items;

    const bookList = booksData.map(book => {
      const volumeInfo = book.volumeInfo || {};
      const imageLinks = volumeInfo.imageLinks || {};

      return {
        title: volumeInfo.title || 'No Title Available',
        image: imageLinks.thumbnail || null,
        id: book.id,
      };
    });

    res.render('books/book-page.ejs', { books: bookList });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error searching for books');
  }
});




// // Route to display the user's book list
// router.get('/booklist', async (req, res) => {
//   const userId = req.session.user._id;  // Get userId from the session

//   try {
//     // Find all Userbooklist entries for the logged-in user and populate the `bookName` field with full book details
//     const userBooks = await Userbooklist.find({ user: userId })
//       .populate('bookName')  // Populate the `bookName` field with book details from the Book model
//       .exec();

//     // Extract the populated books
//     const books = userBooks.map(userBook => userBook.bookName);  // This will give you an array of full book details

//     // Render the booklist.ejs page with the list of books
//     res.render('books/booklist.ejs', { books: books });
//   } catch (error) {
//     console.error('Error retrieving books:', error);
//     res.status(500).send('Error retrieving books');
//   }
// });

module.exports = router;























