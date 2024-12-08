const mongoose = require('mongoose')

const userBookListSchema= new mongoose.Schema({
  bookName:[{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  user:{
    type: mongoose.Schema.Types.ObjectId,
    required: true

  },
  readingStatus: {
    type: String,
    enum: ['Want to Read', 'Currently Reading', 'Finished Reading'],
    default: 'Want to Read'
  },

})
const Userbooklist = mongoose.model('Userbooklist', userBookListSchema)
module.exports=Userbooklist