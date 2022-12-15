const router = require('express').Router()
const authController = require('../controller/authController')

//const { isResetTokenValid } = require('../middleware/user')

router.post('/signup', authController.signup )
router.post('/login', authController.login )
router.get('/logout', authController.logout )

router.post('/verify-email', authController.verifyEmail)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)



module.exports = router