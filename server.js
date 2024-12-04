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
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})


app.get('/', async (req, res) => {
  res.render('index.ejs')
})

app.listen(3000, () => {
  console.log('listning 3000')
})
