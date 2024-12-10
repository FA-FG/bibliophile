const express = require('express');
const router = express.Router();
const Book = require('../models/book');  // Your Book model
const Userbooklist = require('../models/userbooklist');  // Your Userbooklist model


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
    // console.log(books)
    // const userBookid = await Book.findOne({  bookName: books._id});
    // console.log(userBookid.id)
    // userBookid:userBookid.id,
    // Pass books and status options to the view
    res.render('books/booklist.ejs', { books,  statusOptions: ['Want to Read', 'Currently Reading', 'Finished Reading'] });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching book list');
  }
});


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
// console.log(bookId)
  



// router.delete('/booklist', async (req, res) => {
//   const userId = req.session.user._id;  
//   const bookId = req.body.bookId;  
//   console.log(userId);
//   console.log(`hello ${bookId}`);

//   try {
//     // Find the user's book list by the user ID
//     const bookList = await Userbooklist.findOne({ user: userId, bookName: bookId });

//     if (bookList) {
//       await Userbooklist.deleteOne({ user: userId, bookName: bookId })
    
//       console.log('Book removed from the list');
//     }

//     res.redirect('/books/book-page');  

//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error removing book from list');

//   }
//   res.render('books/booklist.ejs')
// });
router.delete('/booklist/:id', async (req, res) => {
  const userId = req.session.user?._id;  
  const bookId = req.params.id;  

  if (!userId || !bookId) {
    return res.status(400).send('Missing user or book ID');
  }

  try {
    // Find and delete the book entry
    const bookEntry = await Userbooklist.findOneAndDelete({ user: userId, bookName: bookId });

    if (!bookEntry) {
      return res.status(404).send('Book not found in the list');
    }

    console.log('Book removed from the list');
    res.redirect('/booklists/booklist');  

  } catch (error) {
    console.error('Error removing book:', error);
    res.status(500).send('Error removing book from list');
  }
});






module.exports = router;
