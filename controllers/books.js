const router = require('express').Router()
const axios = require('axios')

const User = require('../models/user.js')
const Book = require('../models/book.js')
const Userbooklist = require('../models/userbooklist.js')

// render the index page
router.get('/', async (req, res) => {
  res.render('books/index.ejs')
})




router.post('/show/:id', async (req, res) => {

  const userId =  req.session.user._id
  const  bookId  = req.body.bookId

  console.log(userId)

try {
    // Get the book by id
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`)

      const bookData = response.data.volumeInfo;

      const hasBookinList = await Userbooklist.findOne({user: userId, bookName: bookId})
      console.log(hasBookinList)

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
            img: i_link || "No image available"
        });

        await bookToAdd.save();
        console.log("added book")
      } else {
        console.log("not added, book already exist")
      }
    

      if (!hasBookinList){
        // just push the book to the book list
        console.log("Add the book")

        await Userbooklist.save({
          bookName: bookId,  // ObjectId of the book
          user: userId
        })

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

  
  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyAn94OOYgaaN-etaLk1QohYDZUkeQCgcLQ`);


    res.render('books/show.ejs', { book: response.data});

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