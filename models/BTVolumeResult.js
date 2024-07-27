const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { SegmentationResult } = require("../models/BTSegmentationResult");

const VolumeResultSchema = new Schema({
    threshold: { type: Number, required: true },
    volume: { type: Number, required: true },
    niiFile: {
    public_id: { 
        type: String,
        required: true
    },
      secure_url: { 
        type: String,
        required: true
    },
    },
    btSegmentationId: {
      type: Schema.Types.ObjectId,
      ref: 'BTSegmentationResult', 
      required: true
    },
  },{ timestamps: true });
  
  const BTVolumeResult = mongoose.model('VolumeResult', VolumeResultSchema);
  
  module.exports = {
    BTVolumeResult,
  };