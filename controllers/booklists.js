const express = require('express');
const router = express.Router();
const Book = require('../models/book');  // Your Book model
const Userbooklist = require('../models/userbooklist');  // Your Userbooklist model

// Render the user's booklist page
// router.get('/booklist', async (req, res) => {
//   const userId = req.session.user._id;

//   try {
//     // Find the user's booklist and populate book names
//     const userBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');

//     if (!userBookList || !userBookList.bookName.length) {
//       return res.render('books/booklist.ejs', { books: [], statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] }); // If no books, send an empty array
//     }

//     // Get the book details from the populated bookName field
//     const books = userBookList.bookName.map(book => ({
//       name: book.name,
//       image: book.img,
//       status: userBookList.readingStatus, 
//       _id: book._id,
//     })); 


//     // Pass books and status options to the view
//     res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error fetching book list');
//   }
// });

router.get('/booklist', async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Find the user's booklist and populate the bookName field
    const userBookList = await Userbooklist.find({ user: userId }).populate('bookName');

    if (!userBookList || userBookList.length === 0) {
      return res.render('books/booklist.ejs', { books: [], statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
    }

    // Get the book details and map them with their respective reading status
    const books = userBookList.map(entry => ({
      name: entry.bookName.name,
      image: entry.bookName.img,
      status: entry.readingStatus, // Status for each book entry
      _id: entry.bookName._id,
    }));

    // Pass books and status options to the view
    res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching book list');
  }
});


// // updating the book's status
// router.post('/booklist', async (req, res) => {
//   const { status, bookId } = req.body; 
//   const userId = req.session.user._id;


//   console.log("bookId", bookId)
//   try {
//     // Find the user's book list
//     // const userBookList = await Userbooklist.findById(bookId).populate('bookName');
//     // console.log(userBookList)

//     const userBookList = await Userbooklist.find({user: userId})
//     console.log(userBookList)
    
//     if (!userBookList) {
//       return res.status(404).send('User book list not found');
//     }
        
//     userBookList.readingStatus = status; 
//     // await userBookList.save();

//     // After saving the updated book list, render the updated booklist.ejs
//     const updatedUserBookList = await Userbooklist.findOne({ user: userId }).populate('bookName');
//     const books = updatedUserBookList.bookName.map(book => ({
//       name: book.name,
//       image: book.img,
//       status: updatedUserBookList.readingStatus,  
//     }));

   
//     res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error updating book status');
//   }
// });

router.post('/booklist', async (req, res) => {
  const { status, bookId } = req.body; 
  const userId = req.session.user._id;

  console.log("bookId:", bookId);
  console.log("status:", status);

  try {
    // Find the specific Userbooklist entry for the given user and book
    const userBook = await Userbooklist.findOne({ user: userId, bookName: bookId });

    if (!userBook) {
      return res.status(404).send('User book list entry not found');
    }

    // Update the reading status of the specific book in the user's book list
    userBook.readingStatus = status;

    // Save the updated status
    await userBook.save();

    // After updating, get the updated list of books for the user
    const userBookList = await Userbooklist.find({ user: userId }).populate('bookName');

    // Map the book data and statuses for rendering
    const books = userBookList.map(entry => ({
      name: entry.bookName.name,
      image: entry.bookName.img,
      status: entry.readingStatus,  // The updated status of the book
      _id: entry.bookName._id,
    }));

    // Render the updated book list with status options
    res.render('books/booklist.ejs', { books, statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating book status');
  }
});





module.exports = router;
