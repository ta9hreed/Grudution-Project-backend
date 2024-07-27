const jwt = require("jsonwebtoken")
//verify token 
function verifyToken(req,res,next){
    const token = req.headers.token;
    if(token){
        try {
            const decoded =jwt.verify(token,process.env.JWT_SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({message:"invalid token"})
        }

    }else{
       return res.status(401).json({message:"no  token provided"})
    }

};

//verifyToken& Authorthize the user
function verifyTokenAndAuthorization(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id === req.params.id || req.user.IsAdmin){
            next();
        }
        else{
            return res.status(403)
                .json({msg:"You are not allowed"});
        }
    });
};
/*function verifyTokenAndAdmin(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.IsAdmin){
            next();
        }
        else{
            return res.status(403)
                .json({msg:"You are not allowed,only Admin"});
        }
    });
};*/
function verifyTokenAndAdmin(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.IsAdmin){
            next();
        }else{
            return res.status(403).json({message:"you are not allowed,only admin allowed"});
        }
    });
};
module.exports={
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
}