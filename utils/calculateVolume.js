const fs = require('fs');
const nifti = require('nifti-reader-js');

const calculateVolume = async (niiBuffer, threshold = 0.2, sliceThickness = 2.5, imageResolution = 0.001) => {
    try {

        // Ensure the buffer is an ArrayBuffer
        let arrayBuffer = niiBuffer.buffer.slice(niiBuffer.byteOffset, niiBuffer.byteOffset + niiBuffer.byteLength);
        if (nifti.isCompressed(arrayBuffer)) {
            arrayBuffer = nifti.decompress(arrayBuffer);
          }
        // Ensure the file is a valid NIfTI file
        if (!nifti.isNIFTI(arrayBuffer)) {
            throw new Error('The file is not a valid NIfTI file');
        }

        // Read the NIfTI header and image data
        const niftiHeader = nifti.readHeader(arrayBuffer);
        const niftiImage = nifti.readImage(niftiHeader, arrayBuffer);

        // Convert the NIfTI image data to a typed array based on the header datatype
        let niiData;
        switch (niftiHeader.datatypeCode) {
            case nifti.NIFTI1.TYPE_UINT8:
                niiData = new Uint8Array(niftiImage);
                break;
            case nifti.NIFTI1.TYPE_INT16:
                niiData = new Int16Array(niftiImage);
                break;
            case nifti.NIFTI1.TYPE_INT32:
                niiData = new Int32Array(niftiImage);
                break;
            case nifti.NIFTI1.TYPE_FLOAT32:
                niiData = new Float32Array(niftiImage);
                break;
            default:
                throw new Error('Unsupported NIfTI data type');
        }

        // Find the min and max values manually
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < niiData.length; i++) {
            if (niiData[i] < min) min = niiData[i];
            if (niiData[i] > max) max = niiData[i];
        }

        // Normalize the NIfTI data to the range [0, 1]
        const normalizedData = Array.from(niiData, value => (value - min) / (max - min));

        // Apply threshold
        const thresholdedData = normalizedData.map(value => value >= threshold ? 1 : 0);

        // Calculate volume
        const numSlices = niftiHeader.dims[3];
        let volume = 0;
        const sliceArea = niftiHeader.dims[1] * niftiHeader.dims[2];

        for (let sliceIdx = 0; sliceIdx < numSlices - 1; sliceIdx++) {
            const currentSlice = thresholdedData.slice(sliceIdx * sliceArea, (sliceIdx + 1) * sliceArea);
            const nextSlice = thresholdedData.slice((sliceIdx + 1) * sliceArea, (sliceIdx + 2) * sliceArea);

            const currentArea = currentSlice.reduce((sum, value) => sum + value, 0) * imageResolution;
            const nextArea = nextSlice.reduce((sum, value) => sum + value, 0) * imageResolution;

            const avgArea = (currentArea + nextArea) / 2;
            volume += avgArea * sliceThickness;
        }

        if (isNaN(volume)) {
            throw new Error('Volume calculation resulted in NaN');
        }

        return volume;
    } catch (error) {
        throw new Error(`Error calculating volume: ${error.message}`);
    }
};

module.exports = calculateVolume;
