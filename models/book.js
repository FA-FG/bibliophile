const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
  
  
  name: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: false,
  },
  genre: {
    type: String,
    required: false,
  },
  pages: {
    type: Number,
    required: false,
  },
  
});


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;