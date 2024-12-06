const router = require('express').Router()
const router = express.Router();

const User = require('../models/user.js');
const Book = require('../models/book.js');

router.get('/booklist', async (req, res) => {
  try {
      const books = await List.find().populate('bookName user');
      res.render('booklist', { books: books });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving book list');
  }
});


