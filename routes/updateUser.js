const express=require('express');
const router= express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const{User,validateUpdate}=require("../models/usermodel");
const {verifyTokenAndAuthorization,verifyTokenAndAdmin}=require("../middlewares/verifyToken");
/** 
@desc Update User
@route /api/Users/:id
@method PUT
@access private
*/ 
router.put('/:id',verifyTokenAndAuthorization, asyncHandler(async (req,res)=>{

    const {error}= validateUpdate(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    } 
    //console.log(req.headers);
    if(req.body.Password){
    const salt = await bcrypt.genSalt(10);
    req.body.Password= await bcrypt.hash(req.body.Password,salt);
    }
    const UpdateUser = await User.findByIdAndUpdate(
     req.params.id,
     {
      $set: {
       FirstName: req.body.FirstName,
       LastName: req.body.LastName,
       UserName: req.body.UserName,
       Email: req.body.Email,
       Age: req.body.Age,
       Gender: req.body.Gender,
       Title: req.body.Title,
       Specialist: req.body.Specialist,
       Password: req.body.Password,
      }
     },{ new: true }).select("-Password");
    res.status(200).json(UpdateUser);
}));
/** 
@desc get all Users(only admin)
@route /api/Users/
@method get
@access private
*/

router.get("/",verifyTokenAndAdmin ,asyncHandler(async(req,res) =>{
    const users =await User.find().select("-Password");
    res.status(200).json(users);

}));
/** 
@desc get user by ID
@route /api/Users/:id
@method get
@access private(only Admin & user himself)
*/

router.get("/:id",verifyTokenAndAuthorization ,asyncHandler(async(req,res) =>{
    const user =await User.findById(req.params.id).select("-Password");
    if(user){
    res.status(200).json(user);
    }else{
        return res.status(404).json({msg:"user not found"});
        }

}));
/** 
@desc Delete user by ID
@route /api/Users/:id
@method DELETE
@access private(only Admin & user himself)
*/

router.delete("/:id",verifyTokenAndAuthorization ,asyncHandler(async(req,res) =>{
    const user =await User.findById(req.params.id).select("-Password");
    if(user){
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({msg:"user has been deleted successfully .."});
    }else{
        return res.status(404).json({msg:"user not found"});
        }

}));
module.exports=router;