const multer = require("multer");
const path = require('path');
//photo Storage
const photostorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../images')) //path to store the files in
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
        }
        else {
            cb(null, false);
        }
    }

});
//photo  upload middleware 

const Photoupload = multer({
    storage: photostorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported file format" }, false);
        }
    }
})


module.exports = {
    Photoupload,
    //NiiUpload
}