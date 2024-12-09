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

// updating the book's status
router.post('/booklist', async (req, res) => {
  const { status, bookId } = req.body; 
  const userId = req.session.user._id;


  console.log("bookId", bookId)
  try {
    // Find the user's book list
    // const userBookList = await Userbooklist.findById(bookId).populate('bookName');
    // console.log(userBookList)

    const userBookList = await Userbooklist.find({user: userId})
    console.log(userBookList)
    
    if (!userBookList) {
      return res.status(404).send('User book list not found');
    }
        
    userBookList.readingStatus = status; 
    // await userBookList.save();

    // After saving the updated book list, render the updated booklist.ejs
    const updatedUserBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');
    const books = updatedUserBookList.bookName.map(book => ({
      name: book.name,
      image: book.img,
      status: updatedUserBookList.readingStatus,  
    }));

   
    res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating book status');
  }
});




module.exports = router;
