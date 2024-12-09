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
  const userId = req.session.user._id;  // User ID from session
  const bookId = req.body.bookId;  // The book ID from the request body
  console.log(userId);
  console.log(`hello ${bookId}`);

  try {
    // Find the user's book list by the user ID
    const bookList = await Userbooklist.findOne({ user: userId });

    if (bookList && bookList.bookName.includes(bookId)) {
      // Remove the bookId from the bookName array
      bookList.bookName.pull(bookId);
      await bookList.save();
      console.log('Book removed from the list');
    }

    res.redirect('/books/book-page');  // Redirect after successful removal

  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing book from list');
  }
});





router.post('/show/:id', async (req, res) => {

  const userId =  req.session.user._id
  const  bookId  = req.body.bookId

  // console.log(userId)

try {
    // Get the book by id
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)

      const bookData = response.data.volumeInfo;

      const hasList = await Userbooklist.findOne({user: userId})
      // console.log(hasList)

      let bookToAdd = await Book.findOne({ name: bookData.title });

      if (!bookToAdd) {
        bookToAdd = new Book({
            name: bookData.title,
            author: bookData.authors ? bookData.authors.join(', ') : 'Unknown',
            genre: bookData.categories ? bookData.categories.join(', ') : 'Unknown',
            publish_date: bookData.publishedDate || 'Unknown',
            description: bookData.description || 'No description is available',
            rating: bookData.averageRating || 'No rating is available',
            id: response.data.id
        });

        await bookToAdd.save();
        console.log("added book")
      } else {
        console.log("not added, book already exist")
      }
    

      if (hasList){
        // just push the book to the book list
        console.log("has list already")

        if (!hasList.bookName.includes(bookToAdd._id)) {

          hasList.bookName.push(bookToAdd._id)
          await hasList.save()

          console.log("book is pushed")
        }else{
          console.log("book is already there")
        }



    } else {
        const addToList = new Userbooklist({
          bookName: [bookToAdd._id],  
          user: userId,      
          readingStatus: 'Want to Read'  
        });
        
        await addToList.save();
        console.log("add new usr-list")

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

  // console.log(`hi ${bookId}`)
  
  try {
    // Fetch book details from the Google Books API
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`);

    // Find the user's book list
    const userBookList = await Userbooklist.findOne({ user: userId });

    // Find the book object in the Book collection by Google Books API ID
    let bookObj = await Book.findOne({ id: bookId });
    console.log(`11111111111 ${bookObj}`)
    // console.log(`1234 ${bookObj}`)
    // const bookObjectId = bookObj._id 
     
    // console.log(`111 ${bookObjectId}`)

    let isInUserList = false;
    
    // If the user has a book list, check if the book's ID is in the bookName array
    if (userBookList && userBookList.bookName && bookObj) {
      // Compare the book's ID with the IDs in the user’s book list (bookName)
      isInUserList = userBookList.bookName.includes(bookObj._id);  // Compare ObjectIds, not the full object
    }
    

    if(bookObj){
      const bookObjectId = bookObj._id 
      res.render('books/show.ejs', { book: response.data, bookObj: bookObjectId, isInUserList: isInUserList});
  
    }else{
    
    res.render('books/show.ejs', { book: response.data, isInUserList: isInUserList});
    }
    

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