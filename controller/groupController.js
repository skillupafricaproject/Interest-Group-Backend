const Group = require('../model/group')
const asyncErrors = require('./errorController')
const User = require('../model/User')

exports.createGroup = asyncErrors(async(req, res, next)=>{
    
    const newGroupData = {
        groupName: req.body.name,
        description: req.body.description,
        owner: req.user._id
    }
     
    const groupExist = await Group.findOne({groupName})
        if(groupExist){
            return next(res.status(404).json({ msg:'name already exists'}))
        }

    const newGroup = await Group.create(newGroupData)

    const user = await User.findById(req.user._id);
    
    user.groupOwned.push(newGroup._id);


    res.status(201).json({
        success: true,  
        msg: 'group created',
    })
})

exports.getGroup = asyncErrors(async(req, res, next)=>{

    // const user = await User.findOne({id: req.params.id}).select("-password");
    const group = await Group.findById(req.params.id).populate("posts");
    if(!group) return res.status(400).json({ msg: "user does not exist"})
    
    return res.status(200).json({
    status: 'success',
    data: admin
    })
})

exports.getAllGroups = asyncErrors(async(req, res, next)=>{
    const groups = await Group.find({})

    return res.status(200).json({
            status:'success',
            data: groups
    })
})

exports.updateGroup = asyncErrors(async(req, res)=>{
    // const { content, images } = req.body

    // const post = await Post.findOneAndUpdate({_id: req.params.id}, { content, images}).populate("user", "userName photo firstName lastName")

    const group = await Group.findById(req.params.id);
    if(!group) return next(res.status(404).json({ 
        success: false, 
        msg: "Group not Found"
    }))
    if(group.owner.toString() !== req.user._id.toString()){
        return res.status(401).json({
            success: false,
            msg: "You are not the owner of this post"   
        })
    }
    Group.description = req.body.description;
    await group.save();   

    res.status(200).json({
        success: true,
        msg: 'group updated',
        post: group
    })
})