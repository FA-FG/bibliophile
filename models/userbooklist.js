const mongoose = require('mongoose')

const userBookListSchema= new mongoose.Schema({
  bookName:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }],


  user:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  readingStatus: {
    type: String,
    enum: ['Want to Read', 'Currently Reading', 'Finished Reading'],
    default: 'Want to Read'
  },

})
const Userbooklist = mongoose.model('Userbooklist', userBookListSchema)
module.exports=Userbooklist