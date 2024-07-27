const express = require("express");
const router = express.Router();
const { Patient } = require("../models/Patient");
const {User}=require("../models/usermodel");
const  {verifyToken} = require("../middlewares/verifyToken");

// Define the route with the verifyToken middleware
router.get("/", verifyToken, async (req, res) => {
    try {
      // Extract user information from the request object
      const user = req.user;
  
      // Retrieve patients related to the user (assuming the user has a field like surgeonId)
      const patientList = await Patient.find({ Surgeon: user.id });
      res.status(200).json(patientList);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong!" });
    }
  });

/**
 * @desc    Get all patients
 * @route    /api/patients
 * @method    GET
 * @access    public
 */

/*
router.get("/",async (req, res) => {
 try {
  //If you want to get patients filtering with exact one value in Age , ex: Age:25 , we write {Age:25} inside find()
  // We can write the first example with this alternative one : {Age : {$eq:25} } also inside find() , This method called "Comparison Query Operator" (eq = means equal)
  //"Comparison Query Operators":
  // $eq (equal)
  // $ne  (not equal)
  // $lt  (less than)
  // $lte (less than or equal)
  // $gt  (greater than)
  // $gte (greater than or equal)
  // $in  (Matches any of the values specified in an array.)
  // $nin  (Matches none of the values specified in an array.)

  const { minAge, maxAge } = req.query;
  let patientList;
  if (minAge && maxAge) {
   patientList = await Patient.find({ Age: { $gte: minAge, $lte: maxAge } });
   res.status(200).json(patientList);
  } else {
   patientList = await Patient.find();
   res.status(200).json(patientList);
  }
 } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Something went wrong !" });
 }
});
*/

router.get("/:id", async (req, res) => {
 try {
  const patient = await Patient.findById(req.params.id);
  if (patient) {
   res.status(200).json(patient);
  } else {
   res.status(404).json({ message: "patient is not found" });
  }
 } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Something went wrong !" });
 }
});

// change [ES6]
router.post("/", async (req, res) => {
 console.log(req.body);
 const {
  First_Name,
  Last_Name,
  Gender,
  Age,
  Surgeon,
  Risk_Factors_And_Life_Style,
  Family_History,
  Neurological_Examination,
  Symptoms,
  Treatment_History,
  Allergies,
  Duration_And_Progression_Of_Symptoms,
  Diagnosis,
  Medical_History,
  Notes,
  Biopsy_Or_Pathology_Results,
  Lab_Test_Result,
  Current_Medications,
 } = req.body;
 try {
  const patient = new Patient({
   First_Name,
   Last_Name,
   Gender,
   Age,
   Surgeon,
   Risk_Factors_And_Life_Style,
   Family_History,
   Neurological_Examination,
   Symptoms,
   Treatment_History,
   Allergies,
   Duration_And_Progression_Of_Symptoms,
   Diagnosis,
   Medical_History,
   Notes,
   Biopsy_Or_Pathology_Results,
   Lab_Test_Result,
   Current_Medications,
  });
  const result = await patient.save();
  res.status(201).json(result);
 } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Something went wrong !" });
 }
});

router.put("/:id", async (req, res) => {
 try {
  const patient = await Patient.findByIdAndUpdate(
   req.params.id,
   {
    $set: {
     First_Name: req.body.First_Name,
     Last_Name: req.body.Last_Name,
     Gender: req.body.Gender,
     Age: req.body.Age,
     Surgeon: req.body.Surgeon,
     Risk_Factors_And_Life_Style: req.body.Risk_Factors_And_Life_Style,
     Family_History: req.body.Family_History,
     Neurological_Examination: req.body.Neurological_Examination,
     Symptoms: req.body.Symptoms,
     Treatment_History: req.body.Treatment_History,
     Allergies: req.body.Allergies,
     Duration_And_Progression_Of_Symptoms:
      req.body.Duration_And_Progression_Of_Symptoms,
     Diagnosis: req.body.Diagnosis,
     Medical_History: req.body.Medical_History,
     Notes: req.body.Notes,
     Biopsy_Or_Pathology_Results: req.body.Biopsy_Or_Pathology_Results,
     Lab_Test_Result: req.body.Lab_Test_Result,
     Current_Medications: req.body.Current_Medications,
    },
   },
   { new: true }
  );
  res.status(200).json(patient);
 } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Something went wrong !" });
 }
});

router.delete("/:id", async (req, res) => {
 try {
  const patient = await Patient.findById(req.params.id);
  if (patient) {
   await Patient.findByIdAndDelete(req.params.id);
   res.status(200).json({ message: "Patient has been deleted" });
  } else {
   res.status(404).json({ message: "patient is not found" });
  }
 } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Something went wrong !" });
 }
});

module.exports = router;
