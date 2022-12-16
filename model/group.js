const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({

    groupName: {
        type: String, 
        required: true,
        trim: true ,
        unique: true 
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    admin: {
        type: Boolean,
        default: true
    },
    members: [
        {
           user: { type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            }
        }
    ], 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    posts: []
}, {
    timestamps: true
})


const Group = mongoose.model('Group', postSchema)

module.exports = Group