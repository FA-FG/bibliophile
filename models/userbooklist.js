const mongoose = require('mongoose')

const userBookListSchema= new mongoose.Schema({
  book:{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
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
const List = mongoose.model('List', userBookListSchema)
module.exports=List