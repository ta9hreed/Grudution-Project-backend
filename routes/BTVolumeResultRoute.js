const express = require('express');
const router = express.Router();
const  {BTVolumeResult}  = require('../models/BTVolumeResult');
const BTSegmentationResult = require('../models/BTSegmentationResult');
const calculateVolume = require('../utils/calculateVolume');
const axios =require('axios');
const zlib = require('zlib');
const  {verifyToken} = require("../middlewares/verifyToken");

router.post('/', verifyToken, async (req, res) => {
    try {
        const segmentationResult = await BTSegmentationResult.findOne({ _id: req.body.id })
        if (!segmentationResult) {
            return res.status(404).json({ message: 'Segmentation result not found' });
        }

        const { displayedNII } = segmentationResult;
        const bufferResponse = await axios.get(displayedNII.secure_url, {
            responseType: "arraybuffer",
        });
        //const buffer = bufferResponse.data;
        //new
        const buffer = bufferResponse.data
        const volume = await calculateVolume(buffer, req.body.threshold-2);
        const result = {
            volume,
            threshold: req.body.threshold,
            displayedNII,
            btSegmentationId:req.body.id

        }

        res.json(result);
    } catch (error) {
        console.error('Error calculating volume:', error);
        res.status(500).json({ message: 'Failed to calculate volume', error: error.message });
    }
});
router.post("/save-volume", async (req, res) => {
    try {
        const { threshold, volume, displayedNII, btSegmentationId } = req.body
        const btVolumeResult = await BTVolumeResult.findOne({ btSegmentationId, threshold })
        if (btVolumeResult) {
            return res.json(btVolumeResult)
        }
        const volumeResult = new BTVolumeResult({
            threshold,
            volume,
            niiFile: displayedNII,
            btSegmentationId
        });
        const savedVolumeResult = await volumeResult.save();
        res.json(savedVolumeResult);
    } catch (error) {
        console.error('Error saving  volume:', error);
        res.status(500).json({ message: 'Failed to save volume', error: error.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const allVolumeResults = await BTVolumeResult.find({btSegmentationId:req.params.id});
        res.json(allVolumeResults);
    } catch (error) {
        console.error('Error fetching volume results:', error);
        res.status(500).json({ message: 'Failed to fetch volume results', error: error.message });
    }
});

module.exports = router;

