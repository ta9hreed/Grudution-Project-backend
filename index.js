const express= require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const fileRoutes = require('./routes/fileRoutes');
const patientspath=require("./routes/patient");
const authPath =require("./routes/auth");
const UsersPath =require("./routes/users");
const mriscanpath=require('./routes/MRiScan');
const passwordpath =require("./routes/password");
const upload=require("./routes/upload");
const logger= require("./middlewares/logger");
const { notFound,errorHandler } = require("./middlewares/error");
const niiRoutes = require('./routes/niiRoutes');
require("dotenv").config();
const path= require('path');
const helmet =require("helmet");
const cors = require("cors");
const connectToDB =require("./config/db");
const compression =require("compression");
const cloudinary = require("./utils/cloudinary");
//const segmentationRoutes = require('./routes/BTSegmentationResultRoutes');
const volumeRoute = require('./routes/BTVolumeResultRoute');
//const swaggerjsdoc = require("swagger-jsdoc");
//const swaggerui = require("swagger-ui-express");

//connection ToDB
connectToDB();

//init app
const app = express();

//new
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




//static folder (old one)
app.use(express.static(path.join(__dirname,"images")));


// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use('/api/nii', niiRoutes);


//apply middleware 
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(logger);

//Helmet
app.use(helmet());

//cors policy 
app.use (cors());

app.use(compression());

//set view engine 
app.set('view engine' , 'ejs');

//Routes
app.use("/api/patients",patientspath);
app.use("/api/auth",authPath);
app.use("/api/users",UsersPath);
app.use("/api/mriscan",mriscanpath);
app.use("/api/password",passwordpath);
app.use('/api/files', fileRoutes);
app.use('/api/volume', volumeRoute);
// new 
//app.use('/api/segmentation-results', segmentationRoutes);

//app.use('/api/upload',upload);

/*const options ={
    definition:{
        openapi:"3.1.0",
        servers:[
            {
                url:"https://virtual-surgery.onrender.com/",
            },
        ],
    },
    apis:["./routes/*.js"]
};

const spaces = swaggerjsdoc(options)
app.use(
    "/api~docs",
    swaggerui.serve,
    swaggerui.setup(spaces)
)
*/

//error hanlder middleware
app.use(notFound );
app.use(errorHandler);







//running server
const PORT = process.env.PORT||5050;
app.listen(PORT,() => console.log(`server is running in ${process.env.NODE_ENV} on port ${PORT}`));



