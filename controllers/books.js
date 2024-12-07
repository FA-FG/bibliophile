const router = require('express').Router()
const axios = require('axios')

const List = require('../models/userbooklist.js')
const User = require('../models/user.js')
const Book = require('../models/book.js')
// const Userbooklist = require('../models/userbooklist.js')

// render the index page
router.get('/', async (req, res) => {
  res.render('books/index.ejs')
})

// render the book page
router.get('/book-page', async (req, res) => {
  const query = 'flowers+inauthor:keyes'; // Example 
  const startIndex = parseInt(req.query.startIndex) || 0; //example
  const apiKey = 'YOUR_GOOGLE_API_KEY'; 

// geth the books data from the api
  const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=""&startIndex=0&maxResults=40&key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)
  
  // (`https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)

  // save the book data in a var
  const booksData = response.data.items



// get the data needed and map it to a new list of objects
  const bookList = 
  // || {}, to prevent app from crashing if no data is passed
  booksData.map(book => {
      const volumeInfo = book.volumeInfo || {};
      const rating = volumeInfo.averageRating ;
      const imageLinks = volumeInfo.imageLinks || {}
    
    return {
      title: volumeInfo.title || 'No Title Available',
      rating: rating || null, 
      image: imageLinks.thumbnail || null, 
      id: book.id
    }
  })
  // i will filter the the 5 ratings books only
  // .filter(book => book.rating) 

   // sort by heighest 
  const sortedBooks = bookList
    .sort((a, b) => b.rating - a.rating) 
    // number of books to display
    .slice(0, 20);

  
  res.render('books/book-page.ejs', { books: sortedBooks  })
});



// Route to handle individual book details
router.get('/show/:id', async (req, res) => {
  const bookId = req.params.id;  

  
  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`);


    res.render('books/show.ejs', { book: response.data.volumeInfo });

  } catch (error) {
    console.error(error);
  }
});


module.exports = router;