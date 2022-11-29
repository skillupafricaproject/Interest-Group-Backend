const User = require('../model/User')
const asyncErrors = require('./errorController')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

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
    const user = await User.findOne({id: req.params.id}).select("-password");
    if(!user) return res.status(400).json({ msg: "user does not exist"})

    res.status(200).json({
        status: 'success',
        data:
        user
    })

})

exports.deleteMe = asyncErrors(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false});
    res.status(204).json({
        status: 'success',
        data: null
    })
})