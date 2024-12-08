const mongoose = require('mongoose')

const userBookListSchema= new mongoose.Schema({
  bookName:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Book"
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"

  },
  readingStatus: {
    type: String,
    enum: ['Want to Read', 'Currently Reading', 'Finished Reading'],
    default: 'Want to Read'
  },

})
const List = mongoose.model('List', userBookListSchema)
module.exports=List