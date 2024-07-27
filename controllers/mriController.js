const asyncHandler = require("express-async-handler");
const path =require('path');
const fs=require("fs");
const zlib = require('zlib');
const stream = require('stream');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const{cloudinaryUploadImage,cloudinaryRemoveImage,cloudinaryRemoveMultipleImage}=require("../utils/cloudinary")
const{validateCreateMRIScan,validateUpdateMRIScan,MRIScan} = require("../models/MRimodel");
const BTSegmentationResult = require("../models/BTSegmentationResult");
const mongoose = require("mongoose");

// Configure Cloudinary with your cloud name, API key, and API secret
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/** 
@desc Get all MRISCAN
@route /api/mriscan
@method GET
@access (only logged in surgeon)

*/ 
/*
module.exports.getAllMRI = asyncHandler(async (req, res) => {
    const SCAN_PER_PAGE = 3;
    const { pageNumber } = req.query;

    // Assuming the surgeon's ID is stored in req.user.id
    const surgeonId = req.user.id;

    let scans;

    if (pageNumber) {
        scans = await MRIScan.find({ Surgeon: surgeonId }) // Filter scans by surgeon's ID
            .sort()
            .skip((pageNumber - 1) * SCAN_PER_PAGE)
            .limit(SCAN_PER_PAGE)
            .populate("Patient", ["_id", "First_Name", "Last_Name"]);
    } else {
        scans = await MRIScan.find({ Surgeon: surgeonId }) // Filter scans by surgeon's ID
            .sort({ createdAt: -1 })
            .populate("Patient", ["_id", "First_Name", "Last_Name"]);
    }

    res.status(200).json(scans);
});
*/

module.exports.getAllMRI = asyncHandler(async (req, res) => {
    const SCAN_PER_PAGE = 3;
    const { pageNumber } = req.query;
    const surgeonId = req.user.id;

    let scans;

    try {
        if (pageNumber) {
            scans = await MRIScan.find({ Surgeon: surgeonId })
                .sort()
                .skip((pageNumber - 1) * SCAN_PER_PAGE)
                .limit(SCAN_PER_PAGE)
                .populate("Patient", ["_id", "First_Name", "Last_Name"]);
        } else {
            scans = await MRIScan.find({ Surgeon: surgeonId })
                .sort({ createdAt: -1 })
                .populate("Patient", ["_id", "First_Name", "Last_Name"]);
        }

        console.log('Retrieved scans:', scans);

        const decompressedScans = await Promise.all(scans.map(async (scan) => {
            const { url, publicId } = scan.Image;

            if (!url) {
                console.error('No URL found for the image:', scan);
                throw new Error('No URL found for the image');
            }

            console.log('Fetching file from URL:', url);

            try {
                const compressedBuffer = await fetchCompressedFileFromCloudinary(url);
                console.log('Compressed file fetched:', compressedBuffer);

                const decompressedBuffer = await decompressFile(compressedBuffer);
                console.log('File decompressed:', decompressedBuffer);

                scan.Image.decompressedFile = decompressedBuffer.toString('utf-8'); // or appropriate format
                return scan;

            } catch (error) {
                console.error(`Error processing scan with publicId ${publicId}:`, error.message);
                throw error;
            }
        }));

        res.status(200).json({ success: true, message: "MRI scans retrieved successfully", scans: decompressedScans});
        //res.status(200).json(decompressedScans);

    } catch (error) {
        console.error('Error processing scans:', error.message);
        res.status(500).send(error.message);
    }
});

async function fetchCompressedFileFromCloudinary(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        console.log('File fetched from Cloudinary:', response);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('File not found on Cloudinary:', url);
            throw new Error('File not found on Cloudinary');
        } else {
            console.error('Error fetching file from Cloudinary:', error);
            throw new Error('Error fetching file from Cloudinary');
        }
    }
}

async function decompressFile(compressedBuffer) {
    return new Promise((resolve, reject) => {
        zlib.gunzip(compressedBuffer, (err, decompressedBuffer) => {
            if (err) {
                console.error('Error decompressing file:', err);
                return reject(err);
            }
            resolve(decompressedBuffer);
        });
    });
}

/** 
@desc Get MRIScan by id
@route /api/mriscan/:id
@method GET

@access (only logged in surgeon)

*/
/*
module.exports. getMRIById =asyncHandler(async(req,res)=>{
    const scans = await MRIScan.findById(req.params.id).populate("Patient");
    if(!scans){
        res.status(404).json({message:'The MRIScan with the given ID was not found.'})
    }
    if(req.user.id !== scans.Surgeon.toString()){
        return res.status(403).json({message:'access denied'});
    }
    res.status(200).json(scans);

});
*/
module.exports.getMRIById = asyncHandler(async (req, res) => {
    const scan = await MRIScan.findById(req.params.id).populate("Patient");
    
    if (!scan) {
        return res.status(404).json({ message: 'The MRIScan with the given ID was not found.' });
    }
    
    if (req.user.id !== scan.Surgeon.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { url, publicId } = scan.Image;

        if (!url) {
            console.error('No URL found for the image:', scan);
            throw new Error('No URL found for the image');
        }

        console.log('Fetching file from URL:', url);

        const compressedBuffer = await fetchCompressedFileFromCloudinary(url);
        console.log('Compressed file fetched:', compressedBuffer);

        const decompressedBuffer = await decompressFile(compressedBuffer);
        console.log('File decompressed:', decompressedBuffer);

        scan.Image.decompressedFile = decompressedBuffer.toString('utf-8'); // or appropriate format

        res.status(200).json({ success: true, message: 'MRI scan retrieved and decompressed successfully', scan });
    } catch (error) {
        console.error(`Error processing scan with publicId ${publicId}:`, error.message);
        res.status(500).json({ success: false, message: 'Error processing MRI scan', error: error.message });
    }
});



/** 
@desc add new MriSCAN
@route /api/mriscan
@method post
@access private(only log in user)
*/
/*
module.exports.createNewMRI = async (req, res) => {
    try {
        // 1. Validation for image
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }

        // 2. Validation for data
        const { error } = validateCreateMRIScan(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // 3. Upload photo to Cloudinary
        const result = await cloudinaryUploadImage(req.file.path);

        // 4. Create new MRISCAN
        const scan = await MRIScan.create({
            Surgeon: req.user.id,
            Patient: req.body.Patient,
            ScanDetalies: req.body.ScanDetalies,
            Image: {
                url: result.secure_url,
                publicId: result.public_id,
            }
        });

        // 5. Send response to the client
        res.status(201).json(scan);

        // 6. Remove image from the server
        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error('Error creating MRI scan:', error);
        res.status(500).send('Internal server error');
    }
};
*/
module.exports.createNewMRI = async (req, res) => {
    try {
        // 1. Validation for image
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }

        // 2. Validation for data
        const { error } = validateCreateMRIScan(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

          // Compress the file buffer
          zlib.gzip(req.file.buffer, async (err, compressedBuffer) => {
            if (err) {
                return res.status(500).send('Error compressing file');
            }

            console.log("uploading:")
            try {
                // Upload compressed file to Cloudinary
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
                        const scan = await MRIScan.create({
                            Surgeon: req.user.id,
                            Patient: req.body.Patient,
                            ScanDetails: req.body.ScanDetails,
                            // Save Cloudinary URL and public ID
                            Image: {
                                url: result.secure_url,
                                publicId: result.public_id,
                            }
                        });

                        // 5. Send response to the client
                         res.status(201).json(scan);
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
        console.error('Error creating MRI scan:', error);
        res.status(500).send('Internal server error');
    }
};

/** 
@desc update MRISCAN details
@route /api/mriscan/:id
@method put
@access private only user 
*/
module.exports.updateMRI=asyncHandler(async(req,res)=> {
    //1.validation update
    const {error} = validateUpdateMRIScan(req.body);

    if (error) {
        return res.status(400).json({message: error.details[0].message});
    }
    //2.get  MRI by id from database
    const scan =  await MRIScan.findById(req.params.id);
    if(!scan){
        return res.status(404).json({message:'MRI not found'});
    }
    if(req.user.id !== scan.Surgeon.toString()){
        return res.status(403).json({message:'access denied'});}

    const updateMRI=await MRIScan.findByIdAndUpdate(req.params.id,
        {
        $set: {
            ScanDetails : req.body.ScanDetails,
        }
    },{ new : true} ).populate('Patient');

    res.status(200).json(updateMRI);
}
);
/** 
@desc update mri image 
@route /api/mriscan/upload-image/:id
@method put
@access private
*/
/* old one
module.exports.updateMRIImage=asyncHandler(async(req,res)=> {
    //1.validation update

    if (!req.file) {
        return res.status(400).json({message:"no image provided"});
    }
    //2.get  MRI by id from database
    const scan =  await MRIScan.findById(req.params.id);
    if(!scan){
        return res.status(404).json({message:'MRI not found'});
    }
    if(req.user.id !== scan.Surgeon.toString()){
        return res.status(403).json({message:'access denied'});
    }

    //4.delete old mri image
    await cloudinaryRemoveImage(scan.Image.publicId);
    //upload new image

    const imagePath=path.join(__dirname,`../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    //update image in Db
    const updateMRI=await MRIScan.findByIdAndUpdate(req.params.id,
        {
        $set: {
            Image:{
                url:result.secure_url,
                publicId:result.public_id,
                
            }
        }
    },{ new : true} ).populate('Patient');
    res.status(200).json(updateMRI);
    //remove from server
    fs.unlinkSync(imagePath);

}
);
*/
/*
module.exports.updateMRIfile = asyncHandler(async (req, res) => {
    // Validation
    if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
    }

    try {
        // Get MRI by id from the database
        const scan = await MRIScan.findById(req.params.id);
        if (!scan) {
            return res.status(404).json({ message: 'MRI not found' });
        }

        // Check if the requesting user is the owner of the MRI
        if (req.user.id !== scan.Surgeon.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Remove old MRI image from Cloudinary
        await cloudinaryRemoveImage(scan.Image.publicId);

        // Upload new image to Cloudinary
        const result = await cloudinaryUploadImage(req.file.path);

        // Update image in the database
        const updatedMRI = await MRIScan.findByIdAndUpdate(req.params.id, {
            $set: {
                Image: {
                    url: result.secure_url,
                    publicId: result.public_id,
                }
            }
        }, { new: true }).populate('Patient');

        // Respond with the updated MRI object
        res.status(200).json(updatedMRI);

        // Remove the uploaded image file from the server
        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error("Error updating MRI image:", error);
        res.status(500).json({ message: "Failed to update MRI image" });
    }
});
*/
module.exports.updateMRIfile = asyncHandler(async (req, res) => {
    // Validation
    if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
    }

    try {
        // Get MRI by id from the database
        const scan = await MRIScan.findById(req.params.id);
        if (!scan) {
            return res.status(404).json({ message: 'MRI not found' });
        }

        // Check if the requesting user is the owner of the MRI
        if (req.user.id !== scan.Surgeon.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Remove old MRI image from Cloudinary
        await cloudinaryRemoveImage(scan.Image.publicId);

        // Compress the file buffer
        zlib.gzip(req.file.buffer, async (err, compressedBuffer) => {
            if (err) {
                return res.status(500).send('Error compressing file');
            }

            console.log("uploading:")
            try {
                // Upload compressed file to Cloudinary
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

                       // Update image in the database
                        const updatedMRI = await MRIScan.findByIdAndUpdate(req.params.id, {
                            $set: {
                                Image: {
                                url: result.secure_url,
                                publicId: result.public_id,
                                }
                            }
                         }, { new: true }).populate('Patient');

                        // Respond with the updated MRI object
                        res.status(200).json(updatedMRI);

                        // Remove the uploaded image file from the server
                        //fs.unlinkSync(req.file.path);
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
        console.error("Error updating MRI image:", error);
        res.status(500).json({ message: "Failed to update MRI image" });
    }
});

/** 
@desc delete mri image
@route /api/mriscan/:id
@method delete
@access private only logged in user 
*/
module.exports.deleteMRI = asyncHandler(async (req,res)=> {

    const mriscan = await MRIScan.findById(req.params.id);
    
        if(!mriscan){
            
            res.status(404).json({message:'The MRISCAN with the given ID was not found.'})
        }
        if(req.user.id === mriscan.Surgeon.toString()){
            await MRIScan.findByIdAndDelete(req.params.id);
            await cloudinaryRemoveImage(mriscan.Image.publicId);
            res.status(200).json({message : 'is deleted successfully',
                    mriscanId: mriscan._id});
        }
        else{
            res.status(403).json({message:"access denied "})
        }
    
}
);

// Controller function for deleting multiple MRIScans
/** 
@desc delete multiple mri images
@route /api/mriscan/:id
@method delete
@access private only logged in user 
*/
module.exports.deleteMultipleMRIScans = async (req, res) => {
    const { ids } = req.body; // Assuming the array of MRI scan IDs is sent in the request body
    
    try {
        // Find and delete each MRIScan
        for (const id of ids) {
            const mriscan = await MRIScan.findById(id);
            if (!mriscan) {
                // If MRIScan not found, continue to next ID
                continue;
            }

            // Check if user has permission to delete MRIScan
            if (req.user.id === mriscan.Surgeon.toString()) {
                // Delete MRIScan from database
                await MRIScan.findByIdAndDelete(id);

                // Remove image from Cloudinary
                await cloudinaryRemoveImage(mriscan.Image.publicId);
            }
        }

        res.status(200).json({ message: 'MRIScans deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// new api ("/:id", verifyToken,

module.exports.deleteFiles =async (req, res) => {
    const fileId = req.params.id;

    // Step 1: Validate the request ID
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'Invalid ID format.' });
    }

    try {
        // Step 2: Find the document by ID
        const result = await BTSegmentationResult.findById(fileId);
        if (!result) {
            return res.status(404).json({ message: 'Segmentation result not found.' });
        }

        // Step 3: Mark the document as deleted and set the deletedAt timestamp
        result.deletedAt = new Date();
        await result.save();
        // Respond with a success message
        return res.status(200).json({ message: 'Segmentation result marked as deleted successfully.' });

    } catch (error) {
        console.error('Error during soft deletion:', error);
        res.status(500).json({ message: 'Soft deletion failed', error: error.message });
    }
};