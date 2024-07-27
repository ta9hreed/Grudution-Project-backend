const Joi = require('joi');

const validateCreateNiiFile = (data) => {
    const schema = Joi.object({
        Patient: Joi.string().required(),
        ScanDetails: Joi.string().required(),
        opacity: Joi.number().default(0.5),
        threshold: Joi.number().default(0.2),
        sliceX: Joi.number().default(0),
        sliceY: Joi.number().default(0),
        sliceZ: Joi.number().default(0),
        sliceThickness: Joi.number().default(2.5),
        imageResolution: Joi.number().default(0.001)
    });

    return schema.validate(data);
};

module.exports = validateCreateNiiFile;
