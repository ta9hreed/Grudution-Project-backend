const mongoose = require('mongoose');

const NiiFileSchema = new mongoose.Schema({
    Surgeon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Patient: {
        type: String,
        required: true
    },
    ScanDetails: {
        type: String,
        required: true
    },
    Image:
    {
        type:Object,
        default:{
            url:"",
            publicId:null,
        },
        required:true,
        
    },
    Volume: {
        type: Number,
        required: true
    },
    Opacity: {
        type: Number,
        required: true,
        default: 0.5
    },
    Threshold: {
        type: Number,
        required: true,
        default: 0.2
    },
    SliceX: {
        type: Number,
        required: true,
        default: 0
    },
    SliceY: {
        type: Number,
        required: true,
        default: 0
    },
    SliceZ: {
        type: Number,
        required: true,
        default: 0
    },
    SliceThickness: {
        type: Number,
        required: true,
        default: 2.5
    },
    ImageResolution: {
        type: Number,
        required: true,
        default: 0.001
    }
}, { timestamps: true });

module.exports = mongoose.model('NiiFile', NiiFileSchema);
