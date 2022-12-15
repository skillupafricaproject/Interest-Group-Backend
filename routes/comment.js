const router = require('express').Router()
const authController = require('../controller/authController')
const commentController = require('../controller/postController')


router.post('/createComment', authController.protect, commentController.createPost)

module.exports = router