const mongoose =require('mongoose');
const joi=require('joi');
const jwt = require("jsonwebtoken");
const passwordComplexity=require("joi-password-complexity");

//user Schema 

const UserSchema = new mongoose.Schema(
{
FirstName: {
type: String,
required: true,
minlength: 3,
maxlength: 200,
},
LastName: {
type: String,
required: true,
minlength: 3,
maxlength: 200,
},
UserName: {
type: String,
required: true,
minlength: 3,
maxlength: 200,
},
Email: {
type: String,
required: true,
minlength: 5,
maxlength: 100,
unique: true,
trim: true,
},
Birthdate: {
type: Date,
required: true,
},
Gender: {
type: String,
required: true,
minlength: 4,
maxlength: 6,
},
Title: {
type: String,
required: true,
minlength: 3,
maxlength: 200,
},
Specialist: {
type: String,
required: true,
minlength: 3,
maxlength: 200,
},
IsAdmin: {
type: Boolean,
default: false,
}, 
ProfilePhoto:{
type:Object,
default:{
    url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__480.png",
    publicId:null,
}

},
isAccountVerified:{
type:Boolean,
default:false, 
},
Password: {
type: String,
required: true,
minlength: 8,
maxlength: 100,
},
},
{ timestamps: true,
toJSON:{virtuals:true}, // Gets virtuals and converts them to regular fields in JSON
toObject:{virtuals:true} // Converts back from a JS object to a document on querying 
});

//populate Patients that Belongs to this user when he/she get his/her profile
UserSchema.virtual("Patients",{
ref:"Patient", //linking with the model name in lower case
localField:"_id",//the field
foreignField:"Surgeon"//to whichfield in patient model we are linking it to
});


//Generate Token
UserSchema.methods.generateToken = function(){
return jwt.sign({id:this._id,IsAdmin:this.IsAdmin},process.env.JWT_SECRET_KEY);

};
function validateRegister(obj) {
const schema = joi.object({
    FirstName: joi.string().min(3).max(200).required(),
    LastName: joi.string().min(3).max(200).required(),
    UserName: joi.string().min(3).max(200).required(),
    Email: joi.string().trim().min(5).max(100).required().email(),
    Birthdate: joi.date().required(),
    Gender: joi.string().min(4).max(6).required(),
    Title: joi.string().min(3).max(200).required(),
    Specialist: joi.string().min(3).max(200).required(),
    Password: passwordComplexity().required(),
    IsAdmin:joi.bool(),
    IsAccountVerified:joi.bool(),
});
return schema.validate(obj);
};
//validate Login user
function validateLogin(obj){
const schema = joi.object({
    Email : joi.string().trim().min(5).max(100).required().email(),
    Password:passwordComplexity().required(),
});
return schema.validate(obj);
}

//validate Update user
function validateUpdate(obj) {
const schema = joi.object({
    FirstName: joi.string().min(3).max(200),
    LastName: joi.string().min(3).max(200),
    UserName: joi.string().min(3).max(200),
    Email: joi.string().trim().min(5).max(100).email(),
    Birthdate: joi.date(),
    Gender: joi.string().min(3).max(6),
    Title: joi.string().min(3).max(200),
    Specialist: joi.string().min(3).max(200),
    Password: passwordComplexity(),
});
return schema.validate(obj);
};

//validate Email
function validateEmail(obj) {
const schema=joi.object({
    Email: joi.string().trim().min(5).max(100).email().required(),
});
return schema.validate(obj);
}

//validate new password
function validateNewPassword(obj){
const schema = joi.object({
    Password:passwordComplexity().required(),
});
return schema.validate(obj);
}

//validate model
const User = mongoose.model("User", UserSchema);

module.exports={
User,
validateRegister,
validateLogin,
validateUpdate,
validateEmail,
validateNewPassword,
};
