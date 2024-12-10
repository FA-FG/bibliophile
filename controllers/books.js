const router = require('express').Router()
const axios = require('axios')

const User = require('../models/user.js')
const Book = require('../models/book.js')
const Userbooklist = require('../models/userbooklist.js')

// render the index page
router.get('/', async (req, res) => {
  res.render('books/index.ejs')
})


router.delete('/show/:id', async (req, res) => {
  const userId = req.session.user._id;  
  const bookId = req.body.bookId;  
  // console.log(userId);
  // console.log(`hello ${bookId}`);

  try {
    // Find the user's book list by the user ID
    const bookList = await Userbooklist.findOne({ user: userId, bookName: bookId });

    if (bookList) {
      await Userbooklist.deleteOne({ user: userId, bookName: bookId })
    
      console.log('Book removed from the list');
    }

    res.redirect('/books/book-page');  

  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing book from list');
  }
});





router.post('/show/:id', async (req, res) => {

  const userId =  req.session.user._id
  const  bookId  = req.body.bookId

  // console.log(`1111111111111111111${userId}`)
  // console.log(`222222222${bookId}`)

try {
    // Get the book by id
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)

      const bookData = response.data.volumeInfo;



      // let bookToAdd = await Book.findOne({ id: bookId });
      let bookToAdd = await Book.findOne({ name: bookData.title });
      const i_link = bookData.imageLinks ? bookData.imageLinks.thumbnail : ""

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

        await bookToAdd.save();
        console.log("added book")
      } else {
        console.log("not added, book already exist")
      }

      const hasBookInList = await Userbooklist.findOne({ user: userId, bookName: bookToAdd._id });
      // console.log(hasBookInList);
  
      if (!hasBookInList) {
        const addToList = new Userbooklist({
          bookName: bookToAdd._id,  // Reference to the Book model's ObjectId
          user: userId,
          readingStatus: 'Want to Read'  // Default status
        });
  
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
  const query = 'bestsellers+inauthor:keyes'; // Example 
  const startIndex = parseInt(req.query.startIndex) || 0; //example
  const apiKey = 'YOUR_GOOGLE_API_KEY'; 

// geth the books data from the api
  const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=bestseller&startIndex=0&maxResults=40&key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)
  
  // (`https://www.googl-eapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)

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
  const bookId = req.params.id;  
  const userId = req.session.user._id;

  
  try {
    // Fetch book details from the Google Books API
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`);

    let bookObj = await Book.findOne({ id: bookId });

  
    

    let isInUserList = false;
    
    
    
  
    if(bookObj){
      const userBookList = await Userbooklist.findOne({ user: userId, bookName: bookObj._id });
      if (userBookList) {
        isInUserList = true; }
      const bookObjectId = bookObj._id 
      // res.render('books/show.ejs', { book: response.data, bookObj: bookObjectId});
      res.render('books/show.ejs', { book: response.data, bookObj: bookObjectId, isInUserList: isInUserList});
  
    }else{
    
    
    res.render('books/show.ejs', { book: response.data, isInUserList: isInUserList});
    }
    // res.render('books/show.ejs', { book: response.data, bookObj: bookObjectId});

  } catch (error) {
    console.error(error);
  }
});




router.post('/book-page', async (req,res)=>
  {
    const search = req.body.search

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