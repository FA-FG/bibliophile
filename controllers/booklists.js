// connections
const express = require('express');
const router = express.Router();
const Userbooklist = require('../models/userbooklist'); 


router.get('/booklist', async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Find the user's booklist and populate the bookName field 
    const userBookList = await Userbooklist.find({ user: userId }).populate('bookName');

    if (!userBookList || userBookList.length === 0) {
      return res.render('books/booklist.ejs', { books: [], statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
    }

    // Get the book details and map them in a new array
    const books = userBookList.map(entry => ({
      name: entry.bookName.name,
      image: entry.bookName.img,
      status: entry.readingStatus, // Status for each book entry
      _id: entry.bookName._id,
    }));
    

    // Pass books and status options to the view
    res.render('books/booklist.ejs', { books,  statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching book list');
  }
});


router.post('/booklist', async (req, res) => {
  const { status, bookId } = req.body;  //from ejs
  const userId = req.session.user._id; 

  console.log("bookId:", bookId);
  console.log("status:", status);

  try {
    // Find the specific Userbooklist entry for the given user and book
    const userBook = await Userbooklist.findOne({ user: userId, bookName: bookId });
    if (!userBook) {
      return res.status(404).send('User book list not found');
    }

    //instead of the usual find and update hehe :)
    // Update the reading status of the specific book in the user's book list
    userBook.readingStatus = status;
    await userBook.save();

    // After updating, get the updated list of books for the user
    const userBookList = await Userbooklist.find({ user: userId }).populate('bookName');

    // Map the book data in an array agian and statuses for rendering
    const books = userBookList.map(entry => ({
      name: entry.bookName.name,
      image: entry.bookName.img,
      status: entry.readingStatus,  
      _id: entry.bookName._id,
    }));


    // Render the updated book list 
    res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error not updating the status');
  }
});


router.delete('/booklist/:id', async (req, res) => {
  const userId = req.session.user?._id;  
  const bookId = req.params.id;  

  if (!userId || !bookId) {
    return res.status(400).send('user or book ID are missing');
  }

  try {
    // Find and delete the book entry
    const bookEntry = await Userbooklist.findOneAndDelete({ user: userId, bookName: bookId });  //i have to take it feom session and url

    if (!bookEntry) {
      return res.status(404).send('Book is not found');
    }

    console.log('Book removed from the list');
    res.redirect('/booklists/booklist');  

  } catch (error) {
    console.error('Error removing book:', error);
    res.status(500).send('didnt remove book from list');
  }
});

module.exports = router;
