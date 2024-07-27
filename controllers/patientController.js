const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { Patient ,validateCreatePatient,validateUpdatePatient} = require("../models/Patient");
const {User}=require("../models/usermodel");
const  {verifyToken,verifyTokenAndAuthorization} = require("../middlewares/verifyToken");
const mongoose = require ("mongoose");


/**
@desc Get  all patient 
@route /api/patients
@method GET
@access private (only logged in user)

*/ 
module.exports.getAllPatients = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const patientList = await Patient.findActive()
        .where({ Surgeon: user.id })
        .populate("Surgeon",["FirstName","LastName"])
        .sort({createdAt:-1});
        res.status(200).json(patientList);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong!" });
      }
});


/**
@desc Get patients by id
@route /api/patients/:id
@method GET
@access private (only logged in user)

*/

module.exports.getPatientByID = asyncHandler(async (req, res) => {
    const patient = await Patient.findOne({_id: req.params.id ,deletedAt: null});
    if (!patient) {

        return res.status(404).json({ message: 'The patient with the given ID was not found.' })
    }
    if (req.user.id !== patient.Surgeon.toString()) {
        return res.status(403).json({ message: "Access denied. You are not authorized to access this patient record." });
    }
    else {
        await Patient.findById(req.params.id).
            populate("Surgeon", ["-Password"]);

        res.status(200).json(patient);
    }
}
);



/**
@desc add  patients
@route /api/patients
@method post
@access private (only logged in user)

*/
module.exports.addPatient = asyncHandler(async (req, res) => {
    
    const { error } = validateCreatePatient(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    // Access surgeon's ID from req.user
    const surgeonId = req.user.id;

    try {
        const patient = await Patient.create({
            Surgeon: surgeonId, // Use surgeon's ID obtained from the token
            First_Name: req.body.First_Name,
            Last_Name: req.body.Last_Name,
            Gender: req.body.Gender,
            Birthdate: req.body.Birthdate,
            Risk_Factors_And_Life_Style: req.body.Risk_Factors_And_Life_Style,
            Family_History: req.body.Family_History,
            Neurological_Examination: req.body.Neurological_Examination,
            Symptoms: req.body.Symptoms,
            Treatment_History: req.body.Treatment_History,
            Allergies: req.body.Allergies,
            Duration_And_Progression_Of_Symptoms: req.body.Duration_And_Progression_Of_Symptoms,
            Diagnosis: req.body.Diagnosis,
            Medical_History: req.body.Medical_History,
            Notes: req.body.Notes,
            Biopsy_Or_Pathology_Results: req.body.Biopsy_Or_Pathology_Results,
            Lab_Test_Result: req.body.Lab_Test_Result,
            Current_Medications: req.body.Current_Medications,
        });

        res.status(201).json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
@desc update patient
@route /api/patients/:id
@method put
@access private (only logged in user)

*/
module.exports.updatePatient=asyncHandler(async(req,res)=> {
    const {error}= validateUpdatePatient(req.body);
    if (error) {
        res.status(400).json({message:error.details[0].message});
    }
    const patient=await Patient.findById(req.params.id)  ;
    if(!patient){
        res.status(404).json({message:"patient not found"})
    }
    if(req.user.id!== patient.Surgeon.toString()){
        return res.status(403).json({message:"access denied,forddien"});
    }

    const updatePatient =  await Patient.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                First_Name:req.body.First_Name,
                Last_Name:req.body.Last_Name,
                Birthdate: req.body.Birthdate ,
                Gender: req.body.Gender ,
                Risk_Factors_And_Life_Style:req.body.Risk_Factors_And_Life_Style,
                Family_History:req.body.Family_History,
                Neurological_Examination:req.body.Neurological_Examination,
                Symptoms:req.body.Symptoms,
                Treatment_History:req.body.Treatment_History,
                Allergies:req.body.Allergies,
                Duration_And_Progression_Of_Symptoms:req.body.Duration_And_Progression_Of_Symptoms,
                Diagnosis:req.body.Diagnosis,
                Medical_History:req.body.Medical_History,
                Notes:req.body.Notes,
                Biopsy_Or_Pathology_Results:req.body.Biopsy_Or_Pathology_Results,
                Lab_Test_Result:req.body.Lab_Test_Result,
                Current_Medications:req.body.Current_Medications,
        
            
    
            }
        },{new:true}).populate("Surgeon",["-Passward"]);
        res.status(200).json(updatePatient);
        
});

/** 
@desc delete patients
@route /api/patients/:id
@method delete
@access private (only logged in user)

*/
/** 
module.exports.deletePatient=asyncHandler(async (req,res)=> {

    const patient = await Patient.findById(req.params.id);

        if(!patient){
        
            res.status(404).json({message:'The patient with the given ID was not found.'})
        }
        if(req.user.id === patient.Surgeon.toString())
        {
            await Patient.findByIdAndDelete(req.params.id);
            await MRIScan.deleteMany({ patientId:patient._id});
            res.status(200).json({message : 'Deleted Successfully',
            patientId: patient._id});
        }
        else{
            res.status(403).json({message:"access denied,forbidden"});
        }
    }
);
*/

module.exports.deletePatient = async (req, res) => {
    const patientId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid ID format.' });
    }
    try {
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        if (req.user.id !== patient.Surgeon.toString()) {
            return res.status(403).json({ message: "Access denied. You are not authorized to access this patient record." });
        }
        patient.deletedAt = new Date();
        await patient.save();
        res.json({ message: 'Patient marked as deleted successfully.' });

    } catch (error) {
        console.error('Error during soft deletion:', error);
        res.status(500).json({ message: 'Soft deletion failed', error: error.message });
    }
};

/**
@desc Count patients
@route /api/patients/count
@method get
@access private (only logged in user)
*/
module.exports.countPatients = asyncHandler(async (req, res) => {
    try {
        const surgeonId = req.user.id;
        const count = await Patient.findActive()
        .countDocuments({ Surgeon: surgeonId});

        res.status(200).json(count);
    } catch (error) {
        console.error("Error in countPatients:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
@desc  Pagination patients
@route /api/patients
@method get
@access private (only logged in user)
*/
module.exports.paginationPatients = asyncHandler(async (req, res) => {
    try {
        // Extract page number from query parameters
        const pageNumber = parseInt(req.query.pageNumber) || 1; // Default to page 1 if not provided

        // Number of patients per page
        const patientsPerPage = 3; // Adjust as needed

        // Calculate the skip count based on page number
        const skipCount = (pageNumber - 1) * patientsPerPage;

        // Fetch paginated patients from the database
        const patients = await Patient.find({ Surgeon: req.user.id })
            .skip(skipCount)
            .limit(patientsPerPage)
            .populate("Surgeon", ["FirstName", "LastName"])
            .sort({ createdAt: -1 });

        // Send the paginated patients as JSON response
        res.status(200).json(patients);
    } catch (error) {
        // Handle errors
        console.error('Error fetching paginated patients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



