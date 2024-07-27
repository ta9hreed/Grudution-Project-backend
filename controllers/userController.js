const asyncHandler = require("express-async-handler");
const bcrypt =require("bcryptjs");
const mongoose=require("mongoose");
const path= require("path");
const{User,validateUpdate}=require("../models/usermodel");
const{Patient}=require("../models/Patient");
const{MRIScan}=require("../models/MRimodel");
const{cloudinaryUploadImage,cloudinaryRemoveImage,cloudinaryRemoveMultipleImage}=require("../utils/cloudinary");
const fs =require("fs");

/** 
@desc get all Users(only admin)
@route /api/users/
@method get
@access private
*/

module.exports.getAllUsers=asyncHandler(async(req,res) =>{
    const users =await User.find().select("-Password");
    res.status(200).json(users);

});

/** 
@desc Update User
@route /api/users/:id
@method PUT
@access private (only Admin & user himself)
*/ 
module.exports.updateUser= asyncHandler(async (req,res)=>{
    const {error}= validateUpdate(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    } 
    if(req.body.Password){
    const salt = await bcrypt.genSalt(10);
    req.body.Password= await bcrypt.hash(req.body.Password,salt);
    }
    const updateUser = await User.findByIdAndUpdate(
     req.params.id,
     {
      $set: {
       FirstName: req.body.FirstName,
       LastName: req.body.LastName,
       UserName: req.body.UserName,
       Email: req.body.Email,
       Birthdate: req.body.Birthdate,
       Gender: req.body.Gender,
       Title: req.body.Title,
       Specialist: req.body.Specialist,
       Password: req.body.Password,
      }
     },{ new: true }).select("-Password");
    res.status(200).json(updateUser);
});

/** 
@desc get user by ID
@route /api/users/:id
@method get
@access private(only Admin & user himself)
*/

module.exports.getUserById=asyncHandler(async(req,res) =>{
    const user =await User.findById(req.params.id).select("-Password").populate("Patients");
    if(user){
    res.status(200).json(user);
    }
    else{
        return res.status(404).json({msg:"user not found"});
    }

});

/** 
@desc Delete user by ID
@route /api/users/:id
@method DELETE
@access private(only Admin & user himself)
*/

module.exports.deleteUser = asyncHandler(async(req,res) =>{
    const user =await User.findById(req.params.id).select("-Password");
    if(!user){
        return res.status(404).json({msg:"user not found"});
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({msg:"user has been deleted.."});
});

/** 
@desc get Users count(only admin)
@route /api/users/count
@method get
@access private
*/
module.exports.getUserscount=asyncHandler(async(req,res) =>{
    const count = await User.countDocuments();
        res.status(200).json(count);
    
});


/** 
@desc profile photo upload
@route /api/users/profile-photo-upload
@method POST
@access private (only logged in)
*/
/* (old function)
module.exports.profilePhotoUpload = async (req, res) => {
    try {
         // 1- Validation
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }
        // 2- Get the path to the image
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

        // 3- upload to cloudinary
        const result = await cloudinaryUploadImage(imagePath);

        // 4- Get the user from DB 
        const user = await User.findById(req.user.id);

        // 5- Delete the old profile photo if exist
        if (user.ProfilePhoto.publicId !== null) {
            await cloudinaryRemoveImage(user.ProfilePhoto.publicId);
        }

        // 6- Change the profile photo field in the DB
        user.ProfilePhoto = {
            url: result.secure_url,
            publicId: result.public_id,
        };
        await user.save();

        // 7- Send response to client
        res.status(200).json({
            message: "Your profile photo is uploaded successfully",
            ProfilePhoto: { url: result.secure_url, publicId: result.public_id }
        });

        // 8- Remove image from the server
        fs.unlinkSync(imagePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
*/
/** 
@desc profile photo upload
@route /api/Users/profile-photo-upload
@method POST
@access private (only logged in)
*/
/* new one function taghreed */
/*
module.exports.profilePhotoUpload=asyncHandler(async(req,res)=>{
    if(!req.file){
        return res.status(400).json({message:'no file provided'});
    };
    //3.upload photo
    const imagePath=path.join(__dirname,`../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    console.log(result);

    //4.create 
    const user = await User.findById(req.user.id);
    if(user.ProfilePhoto.publicId !== null)  {
        await cloudinaryRemoveImage(user.ProfilePhoto.publicId);
    }    
    user.ProfilePhoto={
                url:result.secure_url,
                publicId:result.public_id,
    }
    await user.save();
    res.status(200).
    json({
        message:"is already profile photo uploaded",
        ProfilePhoto:{
                url:result.secure_url,
                publicId:result.public_id,
    }
});

    //6. remove image from the server
        fs.unlinkSync(imagePath);
})
*/

module.exports.profilePhotoUpload = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
    }

    try {
        // Upload photo directly from multer's temporary file location
        const result = await cloudinaryUploadImage(req.file.path);
        console.log(result);

        // Update user's profile photo in the database
        const user = await User.findById(req.user.id);
        if (user.ProfilePhoto.publicId !== null) {
            await cloudinaryRemoveImage(user.ProfilePhoto.publicId);
        }
        user.ProfilePhoto = {
            url: result.secure_url,
            publicId: result.public_id,
        };
        await user.save();

        // Send response with updated profile photo details
        res.status(200).json({
            message: "Profile photo uploaded successfully",
            ProfilePhoto: {
                url: result.secure_url,
                publicId: result.public_id,
            }
        });
    } catch (error) {
        console.error("Error uploading profile photo:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



