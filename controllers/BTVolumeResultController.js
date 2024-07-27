const asyncHandler = require("express-async-handler");
const { BTVolumeResult } = require("../models/BTVolumeResult");
const calculateVolume = require('../utils/calculateVolume');
//const fetch = require('node-fetch');
const zlib = require('zlib');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
/** 
const uploadAndCalculateVolume = async (req, res) => {
    try {
        const { threshold, niiFile, btSegmentationId } = req.body;

        const volumeResult = new BTVolumeResult({
            threshold,
            niiFile,
            btSegmentationId,
        });

        await volumeResult.save();

        res.status(201).json({ message: 'Volume result saved successfully', volumeResult });
    } catch (error) {
        console.error('Error during volume calculation and save:', error);
        res.status(500).json({ message: 'Failed to calculate and save volume result', error: error.message });
    }
};

module.exports = {
    uploadAndCalculateVolume,
};
*/