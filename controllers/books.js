// connections
const router = require('express').Router()
const axios = require('axios')
// conncet to data bases
const Book = require('../models/book.js')
const Userbooklist = require('../models/userbooklist.js')


// render the index page
router.get('/', async (req, res) => {
  res.render('books/index.ejs')
})


// Delete book from list
router.delete('/show/:id', async (req, res) => {
  // user id object
  const userId = req.session.user._id
  // user book id obj 
  const bookId = req.body.bookId  


  try {
    // Find the book in the user list
    const bookToDelete = await Userbooklist.findOne({ user: userId, bookName: bookId });

    if (bookToDelete) {
      await Userbooklist.deleteOne({ user: userId, bookName: bookId })
    }
    // return to book page
    res.redirect('/books/book-page');  

  } catch (error) {
    console.error(error);
  }
});

// Add a boo to book list
router.post('/show/:id', async (req, res) => {
  // user id object
  const userId =  req.session.user._id
  // book id from the api ex. "J2bCDwAAQBAJ "
  const  bookId  = req.body.bookId


  try {
      // Fetch the book by id
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)


        // The book details are in the volumInfom based on the api book obj
        const bookData = response.data.volumeInfo;
        // The book img url from the api obj
        const i_link = bookData.imageLinks ? bookData.imageLinks.thumbnail : ""

      // check if the book already exist in the database
        let bookToAdd = await Book.findOne({ name: bookData.title });

        // if the book is not ther we add the book data to the database
        if (!bookToAdd) {
          bookToAdd = new Book({
              name: bookData.title,
              author: bookData.authors ? bookData.authors.join(', ') : 'Unknown',
              genre: bookData.categories ? bookData.categories.join(', ') : 'Unknown',
              publish_date: bookData.publishedDate || 'Unknown',
              description: bookData.description || 'No description is available',
              rating: bookData.averageRating || 'No rating is available',
              id: response.data.id,
              img: i_link || 'No image available'
          });

          // add to database
          await bookToAdd.save();
          console.log("added book")
        } else {
          console.log("not added, book already exist")
        }

        // Make sure th user does not have the book already
        const hasBookInList = await Userbooklist.findOne({ user: userId, bookName: bookToAdd._id });
    
        // If no it will be added to the user list database
        if (!hasBookInList) {
          const addToList = new Userbooklist({
            bookName: bookToAdd._id, 
            user: userId,
            // Default status
            readingStatus: 'Want to Read'  
          });
          
          // Add it to the database
          await addToList.save();
          console.log("Book added to the user's list.");
        } else {
          console.log("Book is already in the user's list.");
        }
        res.redirect('/books/book-page') 
    }

  catch (error) {
    console.error(error)
  }
})



// render the book page
router.get('/book-page', async (req, res) => {


  const apiKey = process.env.apiKey; 

// geth the books data from the api
  const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=bestseller&startIndex=0&maxResults=40&key=${apiKey}`)
  

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

    // number of books to display
    .slice(0, 20);

  
  res.render('books/book-page.ejs', { books: bookList  })
});



// Route to handle individual book details
router.get('/show/:id', async (req, res) => {
  // Book id from the api
  const bookId = req.params.id;  
  // user id obj
  const userId = req.session.user._id;
  console.log(bookId)

  
  try {
    // Fetch book details from the Google Books API
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`);

    // find the book id object by api id
    let bookObj = await Book.findOne({ id: bookId });

    let isInUserList = false;
  
    // check if the book is saved in books alread and pass the bookObj._id
    if(bookObj){
      const userBookList = await Userbooklist.findOne({ user: userId, bookName: bookObj._id });
      if (userBookList) {
        isInUserList = true; }
      const bookObjectId = bookObj._id 
      
      res.render('books/show.ejs', { book: response.data, bookObj: bookObjectId, isInUserList: isInUserList});
  
      // if is not saved it will not pass the bookObj._id because it will be null (prevent crashing)
    }else{
    res.render('books/show.ejs', { book: response.data, isInUserList: isInUserList});
    }

  } catch (error) {
    console.error(error);
  }
});



// search route
router.post('/book-page', async (req,res)=>
  {
    const search = req.body.search

    // pass the search input to the api to fetch the book
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${search}&startIndex=0&maxResults=40&key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)

    const booksData = response.data.items

      const bookList = 
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
      // sort by rating 
      const sortedBooks = bookList
      .sort((a, b) => b.rating - a.rating) 
      .slice(0, 40);
  
    
    res.render('books/book-page.ejs', { books: sortedBooks  })

  })

  





module.exports = router;