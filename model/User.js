const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'please provide a name']
    },
    firstName:{
        type: String,
        default: '',
    },
    lastName:{
        type: String,
        default: ''
    },
    birthdate:{
        type: String,
        default: ''
    },
    state:{
        type: String,
        lowercase: true,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: [true, ' please provide an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']
    }, 
    avatar: {
        public_id: String,
        url: String,
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: 6,
        maxlength: 20,
        select: false
    }, 
    role: {
        type: String,
        default:'user'
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }, 
    aboutMe: {
        type: String,
        default: ''
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    followers: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    }
    ],
    following:  [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    }
    ],
    notifications: [],
    groups: [],
    posts: [],
    active: {
    type: Boolean,
    default: true,
    select: false
  }
},{
    timestamps: true 
})

//encrypt the password by using a mongoose middleware(presave middleware)
userSchema.pre('save', async function(next){
    //run this function if password was modified
    if(!this.isModified('password')) return next()
    //the this represents the password of the document being posted
    this.password = await bcrypt.hash(this.password, 12)

    next()
})

userSchema.pre(/^find/, function(next) {
    //this points to the current query
    this.find({active: {$ne: false}});
    
    next()
})

//comparing original password to provided password to log user in
userSchema.methods.comparePassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.newTokenCreate = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 100;
    // console.log({resetToken}, this.passwordResetToken )

    return resetToken;
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp;
    }

    
    return false;
}





const User = mongoose.model('User', userSchema)

module.exports = User