// upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const patientId = req.body.patientId; // or use patient name
    const destinationPath = path.join('uploads/', patientId);
    
    // Create destination directory if it doesn't exist
    fs.mkdir(destinationPath, { recursive: true }, function(err) {
      if (err) {
        if (err.code === 'EEXIST') { // Directory already exists
          return cb(null, destinationPath);
        }
        return cb(err); // Pass other errors to Multer
      }
      cb(null, destinationPath);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;




/*
const express=require('express');
const router= express.Router();
const multer= require("multer");
const path= require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,path.join(__dirname,'../images') ) //path to store the files in
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g,"-")+file.originalname);
    }
});
const upload =multer({storage})



// /api/upload
router.post("/",upload.single("image"),(req,res)=>{
    res.status(200).json({message:"image uploaded"});

})




module.exports=router;
*/