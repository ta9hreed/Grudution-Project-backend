    const asyncHandler = require("express-async-handler");
    const{User,validateEmail,validateNewPassword} = require("../models/usermodel");
    const jwt = require("jsonwebtoken");
    const bcrypt = require("bcryptjs");
    const nodemailer = require("nodemailer");
    const VerificationToken=require("../models/VerificationToken");
    const crypto=require("crypto");
    const sendEmail=require("../utils/sendEmail");


    /**
     *  @desc    Send Reset Password Link
     *  @route   api/password/reset-password-link
     *  @method  POST
     *  @access  public 
     */
    module.exports.sendResetPasswordLinkCtrl = asyncHandler(async(req,res)=>{
        //1-Validation
        const{error}=validateEmail(req.body);
        if(error){
            return res.status(400).json({message:error.details[0].message});
        }

        //Get the user from the DB by email
        const user=await User.findOne({Email:req.body.Email});
        if(!user){
            return res.status(404).json({message:"User with given email doesn't exist !"});
        }

        //3-Creating VerificationToken
        let verificationToken=await VerificationToken.findOne({userId:user._id});
        if(!verificationToken){
            verificationToken=new VerificationToken({
                userId:user._id,
                token:crypto.randomBytes(32).toString("hex"),
            });
            await verificationToken.save();
        }

        //4-Creating Link
        
        const link=`${req.protocol}://${req.get("host")}/api/password/reset-password/${user._id}/${verificationToken.token}`;
        //const link=`${req.protocol}://${req.get("host")}/reset-password/${user._id}/${verificationToken.token}`;

        //5-Creating Html template
        const htmlTemplate=`<a href="${link}">Click here to reset your password </a>`;

        //6-Sending Email
        await sendEmail(user.Email,"Reset Password",htmlTemplate);

        //7-Response to the client
        res.status(200).json({
            message:"Password reset link sent to your email ,please check your inbox"
        })
    });


    /**
     *  @desc    Get Reset Password Link
     *  @route   api/password/reset-password/:userId/:token
     *  @method  GET
     *  @access  public 
     */
    module.exports.getResetPasswordLinkCtrl=asyncHandler(async(req,res)=>{
        const user=await User.findById(req.params.userId);
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

    
        res.redirect(`http://localhost:3000/reset-password/${user._id}/${verificationToken.token}`);
        res.status(200).json({message:"valid url"});
    });


    /**
     *  @desc    Reset Password 
     *  @route   api/password/reset-password/:userId/:token
     *  @method  POST
     *  @access  public 
     */
    module.exports.resetPasswordCtrl=asyncHandler(async(req,res)=>{
        const{error}=validateNewPassword(req.body);
        if(error){
            return res.status(400).json({message:error.details[0].message});
        }
    
        const user=await User.findById(req.params.userId);
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

        if(!user.isAccountVerified){
            user.isAccountVerified=true;
        }

        const salt =await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(req.body.Password,salt);

        user.Password=hashedPassword;
        await user.save();
        //await verificationToken.remove();
        // Delete the verification token from the database
        await VerificationToken.deleteOne({ _id: verificationToken._id });
        
        res.status(200).json({message:"Password reset successfully , please log in"});
    });

















    /**
     *  @desc    Get Forgot Password View
     *  @route   /password/forgot-password
     *  @method  GET
     *  @access  public 
     */

    /*
    module.exports.getForgotPasswordView = asyncHandler((req,res) => {
        res.render('forgot-password');
    });
    */


    /**
     *  @desc    Send Forgot Password Link
     *  @route   /password/forgot-password
     *  @method  POST
     *  @access  public 
     */
    /*
    module.exports.sendForgotPasswordLink = asyncHandler(async(req,res) =>{
    const user = await User.findOne({ Email: req.body.Email });
    if (!user) {
    return res.status(404).json({ message: "user is not found" });
    }

    const secret = process.env.JWT_SECRET_KEY + user.Password;
    const token = jwt.sign({ Email: user.Email, id: user.id }, secret, {
    expiresIn: "10m",
    });

    // change
    //  url: `${req.protocol}://${req.get('host')}/`,
    //  const link = `http://localhost:8000/password/reset-password/${user._id}/${token}`;
    const link = `${req.protocol}://${req.get("host")}/password/reset-password/${
    user._id
    }/${token}`;
    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
    },
    tls: {
    rejectUnauthorized: false,
    },
    });
    const mailOptions = {
    from: process.env.USER_EMAIL,
    to: user.Email,
    subject: "Reset Password",
    html: `<div>
                <h4>click on the link below to rest Your password </h4>
                <p>${link}</p>
            </div>`,
    };
    transporter.sendMail(mailOptions, function (error, success) {
    if (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
    } else {
    console.log("Email sent " + success.response);
    res.render("link-send");
    }
    });
    });
    */

    /**
     *  @desc    Get Reset Password View
     *  @route   /password/reset-password/:userId/:token
     *  @method  GET
     *  @access  public 
     */
    /*
    module.exports.getResetPasswordView = asyncHandler(async(req,res) =>{
        const user = await User.findById(req.params.userId);
        if(!user){
        return res.status(404).json({message:"user is not found"});
        }
    
        const secret = process.env.JWT_SECRET_KEY + user.Password;
        try {
            jwt.verify(req.params.token, secret);
            res.render('reset-password', {Email:user.Email});
        } catch (error) {
            console.log(error);
            res.json({message: "Error"});
        }
    
    });
    */

    /**
     *  @desc     Reset the Password 
     *  @route   /password/reset-password/:userId/:token
     *  @method  POST
     *  @access  public 
     */
    /*
    module.exports.resetThePassword = asyncHandler(async(req,res) =>{
    //TO DO Validation
    const{error}= validateChangePassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.userId);
        if(!user){
        return res.status(404).json({message:"user is not found"});
        }
    
        const secret = process.env.JWT_SECRET_KEY + user.Password;
        try {
            jwt.verify(req.params.token,secret);
            const salt = await bcrypt.genSalt(10);
            req.body.Password=await bcrypt.hash(req.body.Password,salt);
            user.Password=req.body.Password;
            await user.save();
            res.render('success-password');
        } catch (error) {
            console.log(error);
            res.json({message: "Error"});
        }
    
    });
    */
    
