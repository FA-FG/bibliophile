const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const router = express.Router()
const upload = require('../middleware/upload')

router.get('/profile', async (req, res) => {
  const user = await User.findById(req.session.user._id)

  res.render('books/profile.ejs', { user })
})

router.post('/:userId/profile', async (req, res) => {
  try {
    req.body.image = req.file.filename
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

router.put('/:userId', upload, async (req, res) => {
  try {
    const userId = req.session.user._id
    const { username, password } = req.body
    const image = req.file ? req.file.filename : null
    const updateData = { username, password }
    if (image) {
      updateData.image = image
    }
    const currentUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true
    })
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
