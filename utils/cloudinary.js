require('dotenv').config(); 

const cloudinary = require('cloudinary'); 
const streamifier = require('streamifier');
const { Readable } = require('stream');
const zlib = require('zlib');
const stream = require('stream');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//cloudinary upload image  (the old function)

const cloudinaryUploadImage= async (fileToUpload)=>{
    try {
        const data = await cloudinary.uploader.upload(fileToUpload,{
            resource_type:'auto',
            
        });
        return data;
    } catch (error) {
        return error;
        
    }
}


//cloudinary remove image
const cloudinaryRemoveImage= async (imagePublicId)=>{
    try {
        const result =await cloudinary.uploader.destroy(imagePublicId);
        return result;
    } catch (error) {
        return error;
        
    }
}
//cloudinary remove Multiple image
const cloudinaryRemoveMultipleImage= async (PublicIds)=>{
    try {
        const result =await cloudinary.v2.api.delete_resources(PublicIds);
            
        return result;
    } catch (error) {
        return error;
        
    }
}

/* 
const cloudinaryUploadniiImage = async (fileBuffer) => {
    try {
        // Create a readable stream from the file buffer
        const stream = streamifier.createReadStream(fileBuffer);

        // Upload the file stream to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw', // Set resource_type to 'raw' for non-image files
                    format: 'nii', // Set format to 'nii' to specify file format
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Pipe the file stream to the Cloudinary upload stream
            stream.pipe(uploadStream);
        });

        return result;
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};
*/

// Function to upload a compressed buffer to Cloudinary
const uploadCompressedBuffer = (compressedBuffer) => {
    return new Promise((resolve, reject) => {
        // Create a readable stream from the compressed buffer
        const bufferStream = new stream.PassThrough();
        bufferStream.end(compressedBuffer);

        // Upload the stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Pipe the buffer stream to the Cloudinary upload stream
        bufferStream.pipe(uploadStream);
    });
};



module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage,
    uploadCompressedBuffer,
}