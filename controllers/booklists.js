const express = require('express');
const router = express.Router();
const Book = require('../models/book');  // Your Book model
const axios = require('axios');
const Userbooklist = require('../models/userbooklist');  // Your Userbooklist model

// Render the user's booklist page
router.get('/booklist', async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Find the user's booklist
    const userBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');

    if (!userBookList || !userBookList.bookName.length) {
      return res.render('books/booklist.ejs', { books: [], statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] }); // If no books, send an empty array
    }

    // Get the book details from the populated bookName field
    const books = userBookList.bookName.map(book => ({
      name: book.name,
      image: book.img,
      status: userBookList.readingStatus, // Assuming the status is the same for all books in the list
      _id: book._id,
    }));

    // Pass books and status options to the view
    res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
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

// Route to handle updating the book's status
router.post('/update-status/:bookId', async (req, res) => {
  const { status } = req.body; // Get the new status from the form
  const userId = req.session.user._id;
  const bookId = req.params.bookId;

  try {
    // Find the user's book list
    const userBookList = await Userbooklist.findOne({ user: userId });

    if (!userBookList) {
      return res.status(404).send('User book list not found');
    }

    // Find the book and update its status
    const bookIndex = userBookList.bookName.indexOf(bookId);
    if (bookIndex === -1) {
      return res.status(404).send('Book not found in your list');
    }

    // Update the status of the selected book
    userBookList.readingStatus = status; // Update status for all books in the list (can be customized for individual books if needed)

    await userBookList.save();
    res.redirect('/books/booklist'); // Redirect to the updated book list page
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating book status');
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

module.exports = router;
