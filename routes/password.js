const express = require("express");
//const { getForgotPasswordView, sendForgotPasswordLink, getResetPasswordView, resetThePassword } = require("../controllers/passwordController");
const router = express.Router();
// const router =require("express").Router;
const { sendResetPasswordLinkCtrl, getResetPasswordLinkCtrl, resetPasswordCtrl } = require("../controllers/passwordController");

//  /api/password/reset-password-link
router.post("/reset-password-link",sendResetPasswordLinkCtrl);

// /api/password/reset-password/:userId/:token
router
    .route("/reset-password/:userId/:token")
    .get(getResetPasswordLinkCtrl)
    .post(resetPasswordCtrl);




module.exports=router;

//  /password/forgot-password
/*
router
    .route("/forgot-password")
    .get(getForgotPasswordView)
    .post(sendForgotPasswordLink);

//  /reset-password/:userId/:token
router.route("/reset-password/:userId/:token")
    .get(getResetPasswordView)
    .post(resetThePassword);


module.exports=router;
*/