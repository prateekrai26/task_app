const jwt = require("jsonwebtoken")
const User=require("../models/user")

const auth=async (req,res,next)=>
{
 
   try{
     const token=req.header['authorization']
     const data=jwt.verify(token,process.env.SECRET)
     const user=await User.findOne({_id:data._id,"tokens.token":token})
    if(!user)
    {
      throw new Error()
    }
    req.user=user
    req.token=token
    next()
   }catch(e)
   {
    res.send({"error":"Please Authenticate"})
   }
}
module.exports=auth;

