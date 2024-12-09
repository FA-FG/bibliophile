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
  publish_date: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  rating: {
    type: String,
    required: false,
  },
  id: {
    type: String,
    required: false,
  },
  img: {
    type: String,
    required: false,
  },
  
});


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;