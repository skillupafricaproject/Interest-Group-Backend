const router = require('express').Router()
const authController = require('../controller/authController')
const userController = require('../controller/userController')



router.patch('/updateMe', authController.protect, userController.updateMe)
router.get('/getUser/:id', authController.protect, userController.getUser)
router.patch('/deleteMe', authController.protect, userController.deleteMe)


module.exports = router