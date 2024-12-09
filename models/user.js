const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true //created and updated
  }
)

const User = mongoose.model('User', userSchema)
module.exports = User
