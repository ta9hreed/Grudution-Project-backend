const multer = require('multer');

// Configure Multer to store files in memory
const storage = multer.memoryStorage();

const NiiUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const fileExtension = file.originalname.split('.').pop();
        if ( fileExtension === 'nii' || 'nii.gz') {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file format'), false);
        }
    }
});

module.exports = {
    NiiUpload
};
