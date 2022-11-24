const mongoose = require('mongoose')
//const validator = require('validator')
const bcrypt = require('bcryptjs')


const verificationTokenSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 300,
        default: Date.now()
    }
})

//encrypt the password by using a mongoose middleware(presave middleware)
verificationTokenSchema.pre('save', async function(next){
    //run this function if password was modified
    if(!this.isModified('token')) return next()
    //the this represents the token of the document being posted
    this.token = await bcrypt.hash(this.token, 12)

    next()
})

//comparing original password to provided password to log user in
verificationTokenSchema.methods.compareToken = async function(candidateToken, userToken){
    return await bcrypt.compare(candidateToken, userToken)
}





const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema)

module.exports = VerificationToken