const router = require('express').Router()
const authController = require('../controller/authController')
const userController = require('../controller/userController')



router.patch('/updateMe', authController.protect, userController.updateMe)
router.get('/getUser/:id', authController.protect, userController.getUser)
router.get('/getAllUsers', authController.protect, userController.getAllUsers)
router.get('/myProfile', authController.protect, userController.myProfile)
router.delete('/deleteMe', authController.protect, userController.deleteMe)
// router.get('/searchUser', authController.protect, userController.searchUser)
// router.patch('/connect/:id', authController.protect, userController.connect)
// router.patch('/connect/:id/connect', authController.protect, userController.connect)
// router.patch('/disconnect/:id', authController.protect, userController.disconnect)
// router.patch('/disconnect/:id/disconnect', authController.protect, userController.disconnect)
router.get('/follow/:id', authController.protect, userController.followUser)

module.exports = router