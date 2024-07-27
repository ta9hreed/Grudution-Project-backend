const express=require('express');
const router= express.Router();
const{addPatient,getAllPatients,deletePatient,getPatientByID,updatePatient,countPatients,paginationPatients}=require("../controllers/patientController");
const validateObjectId=require("../middlewares/validateObjectId");
const{verifyToken}=require("../middlewares/verifyToken");



//http methods 
router.route( '/' )
      .get(verifyToken,getAllPatients)
      .get(verifyToken,paginationPatients)
      .post(verifyToken,addPatient);
router.route( '/count' )
      .get(verifyToken,countPatients);

   
router.route( '/:id' )
      .get(validateObjectId,verifyToken,getPatientByID)
      .put(validateObjectId,verifyToken,updatePatient)
      .delete(validateObjectId,verifyToken,deletePatient);



module.exports=router;