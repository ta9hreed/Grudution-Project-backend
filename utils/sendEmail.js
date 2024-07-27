const nodemailer = require("nodemailer");

module.exports=async(userEmail,subject,htmlTemplate)=>{
    try{
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.USER_EMAIL, //sender
                pass:process.env.USER_PASS,
            }
        });

        const mailOptions={
            from:process.env.USER_EMAIL, //sender
            to:userEmail,
            subject:subject,
            html:htmlTemplate,
        }

        const info=await transporter.sendMail(mailOptions);
        console.log("Email sent :" + info.response);

    }catch(error){
        console.log(error);
        throw new Error("Internal Server Error (nodemailer)")
    }
}