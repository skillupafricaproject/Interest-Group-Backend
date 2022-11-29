const {promisify} = require('util')
const User = require('../model/User')
const jwt = require('jsonwebtoken')
const VerificationToken = require('../model/verificationToken')
const {mailTransport, genOTP, emailTemplate, plainEmailTemp} = require('../util/mail')
const sendEmail = require('../util/joEmail')
const {isValidObjectId} = require('mongoose')
const asyncErrors = require('./errorController')
const crypto = require('crypto')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESIN
    })
}


exports.signup = asyncErrors(async (req, res, next) => {
        const newUser = new User ({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password
            // confirmPassword: req.body.confirmPassword
        })
        // const userId = User._id
        // const token = signToken(newUser._id)
        //jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        //     expiresIn: process.env.JWT_EXPIRESIN
        // })

        const OTP = genOTP()
        const verificationToken = new VerificationToken({
            owner: newUser._id,
            token: OTP
        })
        await verificationToken.save()
        await newUser.save()

        console.log(OTP)

        mailTransport().sendMail({
            from: 'noreply@gmail.com',
            to: newUser.email,
            subject: 'verify your email account',
            text: 'you are welcome',
            html: emailTemplate(OTP)
    })
    

    // let options = {
    //         from: 'meetmeet4499@gmail.com',
    //         to: newUser.email,
    //         subject: 'verify your email account',
    //         text: 'you are welcome',
    //         html: emailTemplate(OTP)
    // }
    // transport.sendMail(options, function(err, info){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         console.log('message sent');
    //     }
    // })
         
        // mailTransport().sendMail({
        //     from: 'meetmeet4499@gmail.com',
        //     to: newUser.email,
        //     subject: 'verify your email account',
        //     html: emailTemplate(OTP)
        // })
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        })
   
    })
exports.login = asyncErrors(async(req, res, next) =>{
    
        const { email, password } = req.body
        //check if the email and password fields are filled
        if(!email.trim() || !password.trim()){
            return next(res.status(401).json({message: 'please fill in your log in details'}))
        }
         
        //check if user exists in the database and check if password is correct
        const user = await User.findOne({email}).select('+password')
        
        if(!user || !(await user.comparePassword(password, user.password))){
            return next(res.status(401).json('incorrect email or password'))
        }
        // if(user.verified === false){
        //     return next(res.status(400).json({msg: 'please verify your email'}))
        // }
        
        // console.log(req.body)
        
        //send token to client
        const token = signToken(user._id)
        res.cookie('jwt', token, {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            secure: true,
            httpOnly: true
        });
        user.password = undefined;
        res.status(200).json({
            status: 'success',
            token
        })
    
})

exports.verifyEmail = asyncErrors(async(req, res, next) => {
    const {userId, otp} = req.body
    if(!otp.trim()) {
        return res.status(401).json({status:"failure", message:"invalid token"});
    }
    if(!isValidObjectId(userId)) {
        return res.status(401).json({status:"failure", message:"invalid user id"});
    }

    const user = await User.findById(userId)
    if (!user) return res.status(401).json({status:"failure", message:"user not found"});

    if(user.verified) return res.status(401).json({status:"failure", message:"account already verified"});

    const token = await VerificationToken.findOne({owner: userId})
    if(!token) return res.status(401).json({status:"failure", message:"sorry, user not found"});

    const isMatched = await token.compareToken(otp, token.token)
    if(!isMatched) return res.status(401).json({status:"failure", message:"please provide a valid token"});

    user.verified = true; 

    await VerificationToken.findByIdAndDelete(token._id)
    await user.save()

    mailTransport().sendMail({
        from: 'noreply@email.com',
        to: user.email,
        subject: 'verify your email account',
        html: plainEmailTemp("Email Verified Successfully", "Thanks for connecting with us")
    });

    res.status(200).json({success: true, data: {message: "email is successfully verified."}, user:{ name:
    user.name, email: user.email, id: user._id}})

})

exports.forgotPassword = asyncErrors(async (req, res, next) => {
    //get user based on posted email
    const user = await User.findOne({email: req.body.email})
    if(!user) return next(res.status(404).json({message: 'no user with this email'}))

    //generate random token
    const resetToken = user.newTokenCreate()
    await user.save({validateBeforeSave: false})

    console.log(resetToken)

    //send email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/job/resetPassword/${resetToken}`
    //${req.get('host')}
    const message = `forgot your password? submit a patch request with your new password and password confirm to: ${resetURL}.\nif
    you didn\'t forget your password, please ignore this email`;

    try{

        await sendEmail({
            email: user.email,
            subject: 'your password reset token (Valid for 10 min)!',
            message
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false})

        return next(res.status(500).json({message: 'major error'}))
    }
})

exports.resetPassword = asyncErrors(async(req, res, next) => {
    //get user Based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    // console.log(hashedToken)
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires:{$gt: Date.now()} })

    //if expired token or no user
    if(!user) return next(res.status(400).json({message: 'invalid or expired token'}))

    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    //log user in and send JWT
    const token = signToken(user.id);

    res.status(200).json({
        status: 'success',
        token
    });
})


exports.protect = asyncErrors(async(req, res, next) => {
    // getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
        // console.log(token)
    }
    //console.log(token )
    // if(req.headers.authorization){
    //     console.log(req.headers.authorization)
    //     token = req.headers.authorization.split(' ')[1]
    //     console.log(token , 'hello')
    // }

    if(!token){
        return next(res.status(401).json({message: 'you are not logged in! please log in to get access'}))
    }

    //verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded)
    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    // console.log(currentUser);
    if(!currentUser) {
        return next(res.status(401).json({Message: 'user with token no longer exists'}))
    }

    //check if user recently changed password after token was issued
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next(res.status(401).json({message: 'User recently changed password! please log in again!'}))
    }

    
    req.user = currentUser;
    next()
})

exports.updatePassword = asyncErrors(async (req, res, next) => {
    //get user from collection
    const user = await User.findById(req.user.id).select('+password');
    //console.log(req.headers)
    //check if the current password is correct
    if(!(await user.comparePassword(req.body.currentPassword, user.password))) {
        return next(res.status(401).json({
            status: 'failure',
            message: 'your current password is wrong'
        }))
    }

    //if password is correct, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //LOG THE USER IN AND SEND JWT
    const token = signToken(user.id);

    res.status(200).json({
        status: 'success',
        token
    })
})

