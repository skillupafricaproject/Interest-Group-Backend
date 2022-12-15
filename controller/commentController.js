const Comment = require('../model/Comment')
const asyncErrors = require('./errorController')
const Post = require('../model/Post')



exports.createComment = asyncErrors(async(req, res) =>{
    const { content, postId, reply } = req.body

    const newComment = await new Comment({
        user: req.user._id, content, reply
    })

    const post = await Post.findOneAndUpdate({_id: postId}, {
        $push: { comments: newComment._id}
    })

    res.json({newComment})
})