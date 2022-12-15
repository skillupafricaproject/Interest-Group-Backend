const router = require('express').Router()
const authController = require('../controller/authController')
const postController = require('../controller/postController')

router.post('/post/createPost', authController.protect, postController.createPost )
router.get('/post/getPost', authController.protect, postController.getPost )
router.get('/post/getPostOfFollowing', authController.protect, postController.getPostOfFollowing )
router.patch('/post/updatePost/:id', authController.protect, postController.updatePost )
router.get('/post/likeAndUnlikePost/:id', authController.protect, postController.likeAndUnlikePost )
router.delete('/post/deletePost/:id', authController.protect, postController.deletePost )
router.put('/post/addComment/:id', authController.protect, postController.addComment)
router.delete('/post/deleteComment/:id', authController.protect, postController.deleteComment)

module.exports = router