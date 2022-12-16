const Post = require('../model/Post')
const asyncErrors = require('./errorController')
const User = require('../model/User') 


exports.createPost = asyncErrors(async(req, res)=>{
    // const { content, images } = req.body

    const newPostData = {
        caption: req.body.caption,
        image: {
            public_id: "req.body.public_id",
            url: "req.body.url"
        },
        owner: req.user._id
    }

    const newPost = await Post.create(newPostData)

    const user = await User.findById(req.user._id);
    
    user.posts.push(newPost._id);


    res.status(201).json({
        success: true,
        msg: 'post saved',
        post: newPost
    })
})

exports.getPost = asyncErrors(async(req, res)=>{
   const posts = await Post.find({user: [...req.user.followers, req.user._id]}).sort("-createdAt").populate("user", "userName photo firstName lastName")
   .populate({
    path: "comments",
    populate: {
        path: "user likes",
        select: "-password"
    }
   })
   if(!posts) return next(res.status(500).json({ msg: 'No posts found'}))

   res.status(200).json({
    msg: 'post found',
    result: posts.length,
    posts
   })

})

exports.updatePost = asyncErrors(async(req, res)=>{
    // const { content, images } = req.body

    // const post = await Post.findOneAndUpdate({_id: req.params.id}, { content, images}).populate("user", "userName photo firstName lastName")

    const post = await Post.findById(req.params.id);
    if(!post) return next(res.status(404).json({ 
        success: false, 
        msg: "Post not Found"
    }))
    if(post.owner.toString() !== req.user._id.toString()){
        return res.status(401).json({
            success: false,
            msg: "You are not the owner of this post"   
        })
    }
    Post.caption = req.body.caption;
    await post.save();   

    res.status(200).json({
        success: true,
        msg: 'post updated',
        post: post
    })
})

// exports.likePost = asyncErrors(async(req, res) => {
//     const post = await Post.find({_id: req.params.id, likes: req.user._id}) 
//     if(post.length === 0) return next(res.status(400).json({msg: 'you have already liked this post'}))

//     await Post.findOneAndUpdate({ _id: req.params.id }, {
//         $push: { likes: req.user._id}
//     }, { new: true})

//     res.status(200).json({
//         msg: "post liked"
//     })
// })

// exports.unlikePost = asyncErrors(async(req, res) => {
    

//     await Post.findOneAndUpdate({ _id: req.params.id }, {
//         $pull: { likes: req.user._id}
//     }, { new: true})

//     res.status(200).json({
//         msg: "post unliked"
//     })
// })

exports.likeAndUnlikePost = asyncErrors(async(req, res) => {
    
    const post = await Post.findById(req.params.id);

    if(!post){
        return res.status(404).json({
            success: false,
            message: "Post not found"
        })
    }

    if(post.likes.includes(req.user._id)){

        const index = post.likes.indexOf(req.user._id);

        post.likes.splice(index, 1);

        await post.save()

        return res.status(200).json({
            success: true,
            message: "Post unliked",
        });
    }

    else{

        post.likes.push(req.user._id);

        await post.save()

        return res.status(200).json({
            success: true,
            message: "Post Liked",
        })

    }
})

exports.deletePost = asyncErrors(async(req, res)=> {
    
    const post = await Post.findById(req.params.id);
    
    if(!post){
        return res.status(404).json({
            success: false,
            message: "post not found"
        })
    }

    if(post.owner.toString() !== req.user._id.toString()){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    await post.remove();

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id)
    user.posts.splice(index, 1);
    await user.save();  

    res.status(200).json({
        success: true,
        message: "post deleted"
    })
})

exports.getPostOfFollowing = asyncErrors(async(req, res)=>{

    const user = await User.fundById(req.user._id);
    const posts = await Post.find({
        owner: {
            $in: user.following,
        }
    })
    res.status(200).json({
        success: true, 
        posts
    })

})

exports.addComment = asyncErrors(async(req, res)=>{
    
    const post = await Post.findById(req.params.id);

    if(!post){
        return res.status(404).json({
            success: false,
            message: "post not found"
        })
    }

    let commentIndex = -1;
    //checking if comment already exists
    
    post.comments.forEach((item,index)=>{
        if(item.user.toString() === req.user._id.toString()){
            commentIndex = index;
        }
    })

    if(commentIndex !== -1){

        post.comments[commentIndex].comment = req.body.comment;

        await post.save()

        return res.status(200).json({ 
            success: true,
            msg: "comment updated"
        })
    } else{
        post.comments.push({
            user: req.user._id,
            comment: req.body.comment
        })

        await post.save()
        return res.status(200).json({
            success: true,
            msg: "comment added"
        })
    }
})

exports.deleteComment = asyncErrors(async(req, res)=>{
    
    const post = await Post.findById(req.params.id);

    if(!post){
        return res.status(404).json({
            success: false,
            message: "post not found"
        })
    }

    if(post.owner.toString() === req.user._id.toString()){

        if(req.body.comments==undefined){
            return res.status(400).json({
                success: false,
                message: "comment Id is required"
            })
        }

        post.comments.forEach((item,index)=>{
            if(item._id.toString() === req.body.commentId.toString()){
                return post.comments.splice(index,1)
            }
        })

        await post.save()
        return res.status(200).json({
            success: true,
            message: "comment deleted"
        })

    } else{

        post.comments.forEach((item,index)=>{
            if(item.user.toString() === req.user._id.toString()){
                return post.comments.splice(index,1)
            }
        })

        await post.save()
        return res.status(200).json({
            success: true,
            message: "comment deleted"
        })
    }
})