
require('dotenv').config()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const express = require('express')
const app = express()
const morgan = require('morgan')
const session = require('express-session')
const passUserToView = require("./middleware/pass-user-to-view.js")
const isSignedIn = require("./middleware/is-signed-in.js");


// connect to mongodb "database"
mongoose.connect(process.env.MONGODB_URI)
// check if it is conncected and confirm with a console log
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

// middlewares
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }))
 
  // Add our custom middleware right after the session middleware
  app.use(passUserToView);




// require controllers
const authCtrl = require('./controllers/auth')
const bookCtrl = require('./controllers/books')

// use it 
app.use('/auth', authCtrl)
app.use('/books', isSignedIn, bookCtrl)



app.get('/', async (req, res) => {
  res.render('index.ejs')
})


app.listen(3000, () => {
  console.log('listning 3000')
})