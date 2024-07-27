const mongoose=require('mongoose');
async function connectToDB(){
//connect mongo()
    try{
        await mongoose.connect(process.env.MONGO_URI)

        console.log("Mongodb connected successfully!");
    }catch(error){
        console.log(`connection is failed ${error}`);

    }
};
module.exports = connectToDB;  
    /*mongoose.connect(process.env.MONGO_URI)
    .then(()=>
        console.log("Mongodb connected successfully!")
    ).catch((error)=>
        console.log(`connection is failed ${error}`));

    }*/