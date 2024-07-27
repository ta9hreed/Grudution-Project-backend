const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const zlib = require('zlib');
const axios = require('axios');
const stream = require('stream'); 

cloudinary.config({ 
cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
api_key: process.env.CLOUDINARY_API_KEY, 
api_secret: process.env.CLOUDINARY_API_SECRET,
});

const compressAndUploadToCloudinary = (fileBuffer,filename,mimetype) => {
return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    const uploadStream = cloudinary.uploader.upload_stream(
        {
            resource_type: "raw",
            format: 'nii.gz',
        },
        (error, result) => {
            if (error) {
                console.error('Error uploading file to Cloudinary:', error);
                reject(error);
            } else {
                console.log('File uploaded successfully:', result);
                // After upload, send the compressed file URLs to FastAPI


                resolve(result);
            }
        }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    console.log('compression type : ',mimetype);
    const filenameArr = filename.split(".");
    const extension = filenameArr[filenameArr.length - 1]
    if(extension === 'gz' ) 
    {
        console.log('already compressed');
        bufferStream.pipe(uploadStream);
        
    }
    
    else
    {
    console.log('compressed');
    bufferStream.pipe(gzip).pipe(uploadStream);
    }
    
});
};

const sendFilesToFlaskAPI = async (fileUrls) => {
try {
    const response = await axios.post('http://127.0.0.1:5000/uncompress-and-predict', {
        file_urls: fileUrls// Convert file URLs to an array of strings
    });
    console.log('Predictions from Flask API:', response.data);
    // Handle the prediction results here, e.g., upload them to Cloudinary
    return response.data;
} catch (error) {
    console.error('Error sending files to Flask API:', error.response?.data || error.message);
    throw error;
}
};


// Function to upload result to Cloudinary

const uploadResultToCloudinary = (result) => {
// Upload the result to Cloudinary
cloudinary.uploader.upload_large(result, { resource_type: "raw" }, (error, cloudinaryResult) => {
    if (error) {
        console.error('Error uploading compressed result to Cloudinary:', error);
    } else {
        console.log('Compressed result uploaded successfully:', cloudinaryResult);
    }
});
};

module.exports = {
compressAndUploadToCloudinary,
sendFilesToFlaskAPI,
uploadResultToCloudinary
};
