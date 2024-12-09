const express = require('express');
const router = express.Router();
const Book = require('../models/book');  // Your Book model
const Userbooklist = require('../models/userbooklist');  // Your Userbooklist model

// Render the user's booklist page
router.get('/booklist', async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Find the user's booklist and populate book names
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

// Route to handle updating the book's status
router.post('/booklist', async (req, res) => {
  const { status, bookId } = req.body; // Get the new status and bookId from the form
  const userId = req.session.user._id;

  try {
    // Find the user's book list
    const userBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');
    console.log(userBookList)
    
    if (!userBookList) {
      return res.status(404).send('User book list not found');
    }
    
    // Find the index of the book to update its status
    const bookIndex = userBookList.bookName.findIndex(book => book._id.toString() === bookId);

    if (bookIndex === -1) {
      return res.status(404).send('Book not found in your list');
    }

    // Update the status of the specific book (instead of updating all books)
    userBookList.readingStatus = status; // This assumes you want to set status for all books, update this line for individual books if needed
    await userBookList.save();

    // After saving the updated book list, render the updated booklist.ejs
    const updatedUserBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');
    const books = updatedUserBookList.bookName.map(book => ({
      name: book.name,
      image: book.img,
      status: updatedUserBookList.readingStatus,  // Assuming the status is the same for all books in the list
      _id: book._id,
    }));

    // Pass the updated book list and status options to the view
    res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating book status');
  }
});




module.exports = router;
