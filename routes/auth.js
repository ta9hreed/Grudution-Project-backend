const express=require('express');
const router= express.Router();
const{Register,Login,verifyUserAccountCtrl}=require("../controllers/authController");

//api/auth/register
router.post("/register",Register);

//api/auth/login
router.post("/login",Login);

//api/auth/:userId/verify/:token
router.get("/:userId/verify/:token",verifyUserAccountCtrl);



module.exports=router;