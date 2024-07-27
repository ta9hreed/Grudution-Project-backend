const express=require('express');
const router= express.Router();
const {verifyTokenAndAuthorization,verifyTokenAndAdmin, verifyToken}=require("../middlewares/verifyToken");
const validateObjectId=require("../middlewares/validateObjectId");
const{Photoupload}=require("../middlewares/photoUpload")
const{updateUser,getAllUsers,getUserById,deleteUser,getUserscount,profilePhotoUpload}=require("../controllers/userController");

router.route("/")
      .get(verifyTokenAndAdmin ,getAllUsers);

router.route("/count")
      .get(verifyTokenAndAdmin,getUserscount);      

router.route("/:id")
      .put(validateObjectId,verifyTokenAndAuthorization,updateUser)  
      .get(validateObjectId,verifyTokenAndAuthorization ,getUserById)    
      .delete(validateObjectId,verifyTokenAndAuthorization,deleteUser);

router.route("/profile-photo-upload")
      .post(verifyToken,Photoupload.single("image") ,profilePhotoUpload);

module.exports=router;      