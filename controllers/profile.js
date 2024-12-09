const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const router = express.Router()

router.get('/profile', async (req, res) => {
  const user = await User.findById(req.session.user._id)

  res.render('books/profile.ejs', { user })
})

router.get('/:userId/profile', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId)
    if (!currentUser) {
      return res.status(404).send('User not found')
    }
    console.log(currentUser)
    res.render('books/profile.ejs', { User: currentUser })
  } catch (error) {
    console.error('Error fetching user profile:', error.stack)
    res.status(500).send('Error fetching user profile')
  }
})

router.put('/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId)
    if (!currentUser) {
      return res.status(404).send('User not found')
    }

    console.log('req.body', req.body)
    console.log(currentUser)

    if (currentUser._id.equals(req.session.user._id)) {
      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        req.body.password = hashedPassword
      }
      console.log('req.body', req.body)
      await currentUser.updateOne(req.body)
      res.redirect('/profile/profile')
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (error) {
    console.error('Error updating user profile:', error.stack)
    res.status(500).send('Error updating user profile')
  }
})

module.exports = router
