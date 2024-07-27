const express=require('express');
const router= express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const{User,validateLogin,validateRegister}=require("../models/usermodel");
const crypto=require("crypto");
const sendEmail=require("../utils/sendEmail");
const VerificationToken = require('../models/VerificationToken');

/** 
@desc Register
@route /api/auth/register
@method POST
@access Public
*/ 
module.exports.Register=asyncHandler(async(req,res)=>{
    const {error}=validateRegister(req.body);
    if (error) {
    return res.status(400).json({message:error.details[0].message});
    }
    let user = await User.findOne({Email:req.body.Email});
    if(user){
        return res.status(400).json({message:"This user already registered"});

    }
    const salt = await bcrypt.genSalt(10);
    req.body.Password= await bcrypt.hash(req.body.Password,salt);
    user = new User({
     FirstName: req.body.FirstName,
     LastName: req.body.LastName,
     UserName: req.body.UserName,
     Email: req.body.Email,
     Birthdate: req.body.Birthdate,
     Gender: req.body.Gender,
     Title: req.body.Title,
     Specialist: req.body.Specialist,
     Password: req.body.Password,
    });
    //const result =await user.save();
    await user.save();
    const verificationToken = new VerificationToken({
        userId:user._id,
        token:crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();
    const link = `${req.protocol}://${req.get("host")}/api/auth/${user._id}/verify/${verificationToken.token}`;
    const htmlTemplate=`
        <div>
            <p>click on the link below to verify your email</p>
            <a href="${link}">Verify</a>
        </div>`;

    await sendEmail(user.Email,"Verify your Email",htmlTemplate);    
    res.status(201).json({message:"We sent to you an email,please verify your email address"});
});





/** 
@desc Login
@route /api/auth/login
@method POST
@access Public
*/ 
module.exports.Login=asyncHandler(async(req,res)=>{
    const {error}=validateLogin(req.body);
    if (error) {
    return res.status(400).json({message:error.details[0].message});
    }
    let user = await User.findOne({Email:req.body.Email});
    if(!user){
        return res.status(400).json({message:"invalid Email or Password"});

    }
    const isPasswordMatach = await bcrypt.compare(req.body.Password,user.Password);
    if(!isPasswordMatach){
        return res.status(400).json({message:"invalid Email or Password"});
    }
    //sending email (verify account if not verified)
    if(!user.isAccountVerified){
        let verificationToken=await VerificationToken.findOne({
            userId:user._id,
        });
        if(!verificationToken){
            verificationToken=new VerificationToken({
                userId:user._id,
                token:crypto.randomBytes(32).toString("hex"),
            });
            await verificationToken.save();
        }
        const link = `${req.protocol}://${req.get("host")}/api/auth/${user._id}/verify/${verificationToken.token}`;
        const htmlTemplate=`
            <div> 
                <p>click on the link below to verify your email</p>
                <a href="${link}">Verify</a>
            </div>`;
        await sendEmail(user.Email,"Verify your Email",htmlTemplate);   
        res.status(400).json({message:"We sent to you an email,please verify your email address"});
    }
    const token = user.generateToken();
    const{Password, ...other}=user._doc;
    res.status(200).json({...other,token});

});


/** 
@desc Verify User Account
@route /api/auth/:userId/verify/:token
@method GET                       
@access Public   
*/ 
module.exports.verifyUserAccountCtrl=asyncHandler(async(req,res) => {
    
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(400).json({message:"invalid link"});
    }
    const verificationToken=await VerificationToken.findOne({
        userId:user._id,
        token:req.params.token,
    });
    if(!verificationToken){
        return res.status(400).json({message:"invalid link"});
    }
    user.isAccountVerified=true;
    await user.save();
     // Delete the verification token from the database
     await VerificationToken.deleteOne({ _id: verificationToken._id });
    //await verificationToken.remove();
    
    //res.status(200).json({message:"Your account has been verified successfully"});
    // Construct the JSON response for the backend developer
    const backendResponse = {
        message: "Your account has been verified successfully"
    };

    // Send the JSON response to the backend developer
    console.log(backendResponse);

    res.redirect(`http://localhost:3000/verifyemail/${user._id}/verify/${verificationToken.token}`);
   
});







