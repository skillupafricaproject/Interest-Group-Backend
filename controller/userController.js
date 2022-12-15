const User = require('../model/User')
const asyncErrors = require('./errorController')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.searchUser = asyncErrors(async(req, res, next)=>{
    const users = await User.find({username: {$regex: req.query.userName}})
    .limit(10).select("firstName lastName userName photo")

    res.json({users})
})

exports.updateMe = asyncErrors(async (req, res, next) => {
    //create error if user Posts password data
    if(req.body.password) {
        return next(res.status(400)
        .json({message: 'you cannot update your password here. please use the forget password route'}))
    }

    //filtered out unwanted fields not allowed to get updated
    // const filteredBody =filterObj(req.body)
    const filteredBody =filterObj(req.body, 'firstName', 'lastName', 'birthdate', 'state', 'gender', 'photo', 'aboutMe');


    // update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, 
    // const updatedUser = await User.findByIdAndUpdate(req.body, 
        {new: true, runValidators: true,})

    res.status(200).json({
        status:'success',
        data: {
            user: updatedUser
        }
        
    })
})

exports.getUser = asyncErrors(async(req, res, next) =>{
    // const user = await User.findOne({id: req.params.id}).select("-password");
    const user = await User.findById(req.params.id).populate("posts");
    if(!user) return res.status(400).json({ msg: "user does not exist"})

    res.status(200).json({
        status: 'success',
        data: user
    })

})

exports.getAllUsers = asyncErrors(async(req,res, next)=>{
    const users = await User.find({}) 
    res.status(200).json({
        status:'success',
        data: users
    })
})

exports.myProfile = asyncErrors(async(req, res, next) =>{
    const user = await User.findById(req.user._id).populate("posts")

    res.status(200).json({
            status:'success',
            user,
})
})

exports.deleteMe = asyncErrors(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false});
     const user = await user.findById(req.user._id)
     const userId = user._id
     const following = user.following
    const followers =  user.followers

    //removing user from followers following
    for( let i = 0; i < followers.length; i++ ) {
        const follower = await User.findById(followers[i]);

        const index = follower.following.indexOf(useId);
        follower.following.splice(index,1)
        await follower.save()
    }


    //removing user from following's follower
    for( let i = 0; i < followers.length; i++ ) {
        const follows = await User.findById(followers[i]);

        const index = follows.following.indexOf(userId);
        follows.following.splice(index,1)
        await follows.save()
    }


    //log user out after deleting profile
res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

    res.status(204).json({
        status: 'success',
        data: null
    })
})

// exports.connect = asyncErrors(async(req, res, next) => {
//     const user = await User.find({_id: req.params._id, friends: req.user._id})
//     if (user.length > 0) return res.status(400).json({msg: 'you are connected to this user'})

//     await User.findOneAndUpdate({_id: req.params.id}, {
//         $push: { connections: req.user._id}
//     },
//     { new: true })

//     // await User.findOneAndUpdate({ _id: req.user.id}, {
//     //     $push: { connections: req.params.id}
//     // }, { new: true})

//     res.status(201).json({msg: 'you are now connected', user})
// })

// exports.disconnect = asyncErrors(async(req, res, next) => {
    
//     await User.findOneAndUpdate({_id: req.params.id}, {
//         $pull: { connections: req.user._id}
//     },
//     { new: true })

//     // await User.findOneAndUpdate({ _id: req.user.id}, {
//     //     $push: { connections: req.params.id}
//     // }, { new: true})

//     res.status(201).json({msg: 'you have been disconnected'})
// })

exports.followUser = asyncErrors(async(req, res)=>{

    const userToFollow = await User.findById(req.params.id)
    const loggedInUser = await User.findById(req.user._Id)

    if(!userToFollow){
        return res.status(404).json({
            success: false, 
            message: "user not found"
        })
    }

    if(loggedInUser.following.includes(userToFollow._id)){

        const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
        const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);
        
        loggedInUser.following.splice(indexfollowing,1)
        userToFollow.followers.splice(indexfollowers,1)

        await loggedInUser.save()
        await userToFollow.save()

        res.status(200).json({
            success: true,
            message: "user unfollowed"
        })
        
        // return res.status(400).json({
        //     success: false,
        //     message: "user already followed"
        // })
    } else{

        
    loggedInUser.following.push(userToFollow._id)
    userToFollow.followers.push(loggedInUser._id)

    await loggedInUser.save()
    await userToFollow.save()
    
    res.status(200).json({
        success: true,
        message: "user followed"
    })

    }
})