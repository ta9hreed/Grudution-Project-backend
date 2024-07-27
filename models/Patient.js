const mongoose=require("mongoose");
const joi=require('joi');
const { User } = require("../models/usermodel");
const PatientSchema=new mongoose.Schema({
    Surgeon:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    First_Name:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:200,
    },
    Last_Name:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:200,
    },
    Gender:{
        type:String,
        required:true,
        trim:true,
        minlength:4,
        maxlength:6,
    },
    Birthdate: {
        type: Date,
        required: true,
    },
    Risk_Factors_And_Life_Style:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Family_History:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Neurological_Examination:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Symptoms:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Treatment_History:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Allergies:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Duration_And_Progression_Of_Symptoms:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Diagnosis:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Medical_History:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Notes:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Biopsy_Or_Pathology_Results:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Lab_Test_Result:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    Current_Medications:{
        type:String,
        trim:true,
        maxlength:1000,
    },
    deletedAt: {
        type: Date,
        default: null,
    }
},{
    timestamps:true
});

//new
// Static method to find all non-deleted patients
PatientSchema.statics.findActive = function () {
    return this.find({ deletedAt: null });
};

function validateCreatePatient(obj){
    const schema = joi.object
    ({
        
        First_Name:joi.string().min(3).max(200).required(),
        Last_Name:joi.string().min(3).max(200).required(),
        Gender:joi.string().min(4).max(6).required(),
        Birthdate: joi.date().required(),
        Risk_Factors_And_Life_Style:joi.string().min(3).max(1000),
        Family_History:joi.string().min(3).max(1000),
        Neurological_Examination:joi.string().min(3).max(1000),
        Symptoms:joi.string().min(3).max(1000),
        Treatment_History:joi.string().min(3).max(1000),
        Allergies:joi.string().min(3).max(1000),
        Duration_And_Progression_Of_Symptoms:joi.string().min(3).max(1000),
        Diagnosis:joi.string().min(3).max(1000),
        Medical_History:joi.string().min(3).max(1000),
        Notes:joi.string().min(3).max(1000),
        Biopsy_Or_Pathology_Results:joi.string().min(3).max(1000),
        Lab_Test_Result:joi.string().min(3).max(1000),
        Current_Medications:joi.string().min(3).max(1000),
        
    });
    return schema.validate(obj);
};

function validateUpdatePatient(obj){
    const schema=joi.object
    ({ 
        First_Name:joi.string().min(3).max(200),
        Last_Name:joi.string().min(3).max(200),
        Birthdate: joi.date(),
        Gender:joi.string().min(4).max(6),
        Risk_Factors_And_Life_Style:joi.string().min(3).max(1000),
        Family_History:joi.string().min(3).max(1000),
        Neurological_Examination:joi.string().min(3).max(1000),
        Symptoms:joi.string().min(3).max(1000),
        Treatment_History:joi.string().min(3).max(1000),
        Allergies:joi.string().min(3).max(1000),
        Duration_And_Progression_Of_Symptoms:joi.string().min(3).max(1000),
        Diagnosis:joi.string().min(3).max(1000),
        Medical_History:joi.string().min(3).max(1000),
        Notes:joi.string().min(3).max(1000),
        Biopsy_Or_Pathology_Results:joi.string().min(3).max(1000),
        Lab_Test_Result:joi.string().min(3).max(1000),
        Current_Medications:joi.string().min(3).max(1000),
        
        

    });
    return schema.validate(obj);
};


const Patient=mongoose.model("Patient",PatientSchema);

module.exports={
    Patient,
    validateCreatePatient,
    validateUpdatePatient,
}