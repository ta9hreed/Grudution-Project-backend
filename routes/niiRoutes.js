const express = require('express');
const{ verifyToken }=require("../middlewares/verifyToken");
//const { NiiUpload,Photoupload } = require("../middlewares/photoUpload");
const { createNewNiiFile } = require('../controllers/niiController');
const { NiiUpload } = require('../utils/niiUpload'); // Adjust path if needed

const router = express.Router();

router.post('/', verifyToken, NiiUpload.single('file'), createNewNiiFile);

module.exports = router;
