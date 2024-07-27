const fs = require('fs');
const NiiFile = require('../models/NiiFile');
const { cloudinaryUploadImage,uploadCompressedBuffer} = require('../utils/cloudinary');
const calculateVolume = require('../utils/calculateVolume');
const validateCreateNiiFile = require('../validation/niiFileValidation');
const zlib = require('zlib');
const stream = require('stream');
const cloudinary = require('cloudinary').v2;


// Create new NiiFile
/*
module.exports.createNewNiiFile = async (req, res) => {
    try {
        // Validate image
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Validate data
        const { error } = validateCreateNiiFile(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }


        // Upload to Cloudinary
        console.log(req.file.buffer);
        const result = await cloudinaryUploadniiImage(req.file.buffer);
        console.log(result);
         // Ensure the Cloudinary response contains publicId and url
         if (!result || !result.public_id || !result.url) {
            throw new Error('Cloudinary upload failed: missing publicId or url');
        }

        // Calculate tumor volume
        const niiFilePath = req.file.path;
        const { threshold, sliceThickness, imageResolution } = req.body;

        console.log('Calculating volume with params:', {
            //niiFilePath,
            threshold,
            sliceThickness,
            imageResolution
        });

        const volume = await calculateVolume(
            //new
            //fileBuffer, // Pass buffer instead of URL
            niiFilePath,
            threshold || 0.2,
            sliceThickness || 2.5,
            imageResolution || 0.001
        );

        if (isNaN(volume)) {
            throw new Error('Volume calculation resulted in NaN');
        }
        
        // Create new NiiFile
        const niiFile = await NiiFile.create({
            Surgeon: req.user.id,
            Patient: req.body.Patient,
            ScanDetails: req.body.ScanDetails,
            Volume: volume,
            Opacity: req.body.opacity,
            Threshold: req.body.threshold,
            SliceX: req.body.sliceX,
            SliceY: req.body.sliceY,
            SliceZ: req.body.sliceZ,
            SliceThickness: req.body.sliceThickness,
            ImageResolution: req.body.imageResolution,
            // Save Cloudinary URL and public ID
            Image: {
                url: result.secure_url,
                publicId: result.public_id,
            }
        });
       

        // Send response to the client in the desired format
        res.status(201).json({ message: `Volume = ${volume}`, niiFile });

        // Remove the .nii file from the server
        fs.unlinkSync(req.file.path);

    } catch (error) {
        console.error('Error creating Nii file:', error);
        res.status(500).send(`Internal server error: ${error.message}`);
    }
};
*/


// Configure Cloudinary with your cloud name, API key, and API secret
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* 
module.exports.createNewNiiFile = async (req, res) => {
    try {
        // Validate image
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Validate data
        const { error } = validateCreateNiiFile(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Compress the file buffer
        zlib.gzip(req.file.buffer, async (err, compressedBuffer) => {
            if (err) {
                return res.status(500).send('Error compressing file');
            }

            // Upload compressed file to Cloudinary using upload_stream
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'raw' },
                async (error, result) => {
                    if (error) {
                        return res.status(500).send('Cloudinary upload failed');
                    }

                    // Ensure the Cloudinary response contains publicId and secure_url
                    if (!result || !result.public_id || !result.secure_url) {
                        return res.status(500).send('Cloudinary upload failed');
                    }

                    // Proceed with the rest of your logic, such as saving the Cloudinary URL and public ID to your database

                    // Send response to the client
                    res.status(200).send('File uploaded successfully');
                }
            );

            const bufferStream = new stream.PassThrough();
            bufferStream.end(compressedBuffer);
            bufferStream.pipe(uploadStream);
        });

        
    } catch (error) {
        console.error('Error creating Nii file:', error);
        res.status(500).send(`Internal server error: ${error.message}`);
    }
};
*/
module.exports.createNewNiiFile = async (req, res) => {
    try {
        // Validate image
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Validate data
        const { error } = validateCreateNiiFile(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const generatedFileName = 'brain';
        // Compress the file buffer
        zlib.gzip(req.file.buffer, async (err, compressedBuffer) => {
            if (err) {
                return res.status(500).send('Error compressing file');
            }

            console.log("uploading:")
            try {
                // Upload compressed file to Cloudinary
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'raw' ,
                        format:"nii.gz",
                    },
                    async (error, result) => {
                        if (error) {
                            return res.status(500).send('Cloudinary upload failed');
                        }

                        // Ensure the Cloudinary response contains publicId and secure_url
                        if (!result || !result.public_id || !result.secure_url) {
                            return res.status(500).send('Cloudinary upload failed');
                        }

                        // Calculate tumor volume
                        const niiFilePath = req.file.path;
                        const { threshold, sliceThickness, imageResolution } = req.body;

                        console.log('Calculating volume with params:', {
                            //niiFilePath,
                            threshold,
                            sliceThickness,
                            imageResolution
                        });

                        const volume = await calculateVolume(
                            req.file.buffer,
                            threshold || 0.2,
                            sliceThickness || 2.5,
                            imageResolution || 0.001
                        );

                        if (isNaN(volume)) {
                            throw new Error('Volume calculation resulted in NaN');
                        }

                        // Proceed with the rest of your logic, such as saving the Cloudinary URL and public ID to your database
                        const niiFile = await NiiFile.create({
                            Surgeon: req.user.id,
                            Patient: req.body.Patient,
                            ScanDetails: req.body.ScanDetails,
                            Volume: volume,
                            Opacity: req.body.opacity,
                            Threshold: req.body.threshold,
                            SliceX: req.body.sliceX,
                            SliceY: req.body.sliceY,
                            SliceZ: req.body.sliceZ,
                            SliceThickness: req.body.sliceThickness,
                            ImageResolution: req.body.imageResolution,
                            // Save Cloudinary URL and public ID
                            Image: {
                                url: result.secure_url,
                                publicId: result.public_id,
                            }
                        });

                        // Send response to the client in the desired format
                        res.status(201).json({ message: `Volume = ${volume}`, niiFile });
                    }
                );

                const bufferStream = new stream.PassThrough();
                bufferStream.end(compressedBuffer);
                bufferStream.pipe(uploadStream);
                console.log("finished")
            } catch (error) {
                console.error('Error uploading file to Cloudinary:', error);
                res.status(500).send('Error uploading file to Cloudinary');
            }
        });
    } catch (error) {
        console.error('Error creating Nii file:', error);
        res.status(500).send(`Internal server error: ${error.message}`);
    }
};