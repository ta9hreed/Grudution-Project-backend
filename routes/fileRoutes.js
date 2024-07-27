const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { compressAndUploadToCloudinary, sendFilesToFlaskAPI } = require("../controllers/fileController");
const { NiiUpload } = require("../utils/niiUpload");
const  {verifyToken} = require("../middlewares/verifyToken");
const BTSegmentationResult = require('../models/BTSegmentationResult');
const { User } = require('../models/usermodel'); // Ensure correct case
const { Patient } = require('../models/Patient'); // Import your MongoDB model

router.post("/",verifyToken, NiiUpload.array('file'), async (req, res) => {
    console.log('Request Body:', req.body); // Check the request body
    console.log('Uploaded Files:', req.files); // Check the uploaded files
    const { files } = req;
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded.' });
    }

    const patientId = req.body.patientId; // Assuming patientId is sent in the request body
    if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required.' });
    }

    // Array to store the URLs of the uploaded files
    let fileUrls = [];
    
    try {
        // Upload each file to Cloudinary
        for (const file of files) {
            const uploadedFile = await compressAndUploadToCloudinary(file.buffer,file.originalname,file.mimetype);
            fileUrls.push({ public_id: uploadedFile.public_id, secure_url: uploadedFile.secure_url });
        }
        
        // Send files to Flask API and wait for the results
        const flaskResponse = await sendFilesToFlaskAPI(fileUrls);

        // Prepare the document to be saved in MongoDB
        const segmentationResult = new BTSegmentationResult({
            displayedNII: {
                public_id: fileUrls[0].public_id, // Assuming the first uploaded file is the displayed NII
                secure_url: fileUrls[0].secure_url,
            },
            patientId: patientId,
            results: flaskResponse.results.map(result => ({
                public_id: result.public_id,
                secure_url: result.secure_url,
            })),
            brainGLB:flaskResponse.brainGLB,
            tumorGLB:flaskResponse.tumorGLB,
        });

        // Save the document to MongoDB
        const savedResult = await segmentationResult.save();

        // Respond with the file URLs and saved results
        res.json({ file_urls: fileUrls, results: savedResult });

    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});

// GET route to retrieve all segmentation results

router.get("/patient/:id",verifyToken, async (req, res) => {
    try {
        const results = await BTSegmentationResult.find({ patientId: req.params.id ,deletedAt : null })
        .select("_id results name");
        const filteredResult = results
        .map(result => ({_id: result._id,name:result.name, thumbnail: result.results[0]}));
        res.json(filteredResult);
    } catch (error) {
        console.error('Error fetching segmentation results:', error);
        res.status(500).json({ message: 'Failed to fetch segmentation results', error: error.message });
    }
});

router.get("/file/:id",verifyToken, async (req, res) => {
    try {
        //findById(req.params.id)
        const results = await BTSegmentationResult.findOne({ _id: req.params.id, deletedAt : null });
        if(!results)
            {
                return res.status(400).json("this MRI id not found");
            }
         return res.json(results);
    } catch (error) {
        console.error('Error fetching segmentation results:', error);
        res.status(500).json({ message: 'Failed to fetch segmentation results', error: error.message });
    }
});

router.get("/get-ar/:id", async (req, res) => {
    try {
        const results = await BTSegmentationResult.findOne({ _id: req.params.id, deletedAt : null });
        console.log(results);
        if(!results)
            {
                return res.status(400).json("this id not found");
            }
        const {brainGLB,tumorGLB} = results; 
        return res.json({brainGLB,tumorGLB});
    } catch (error) {
        console.error('Error fetching segmentation results:', error);
        res.status(500).json({ message: 'Failed to fetch segmentation results', error: error.message });
    }
});
/** 
router.get("/", async (req, res) => {
    try {
        const results = await BTSegmentationResult.find();
        res.json(results);
    } catch (error) {
        console.error('Error fetching segmentation results:', error);
        res.status(500).json({ message: 'Failed to fetch segmentation results', error: error.message });
    }
});
*/
module.exports = router;
