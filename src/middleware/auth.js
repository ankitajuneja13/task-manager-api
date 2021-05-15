const jwt= require('jsonwebtoken')
const User=require('../models/user')

const auth = async (req,res, next)=>{
   try{
           const token =  req.header('Authorization').replace('Bearer ','')
           const decoded= jwt.verify(token, process.env.JWT_SECRET)
           const user= await User.findOne({_id: decoded._id, 'tokens.token' : token}) //get the user from id payload token & check if tokn is present in array

           if(!user)
           {
               throw new Error() //triggers catch
           }

           req.token= token  //keep track of token so that user get logout from specific device only 
           req.user = user //keep track of user, later used in login/logout purpose
           next()
   }catch(e)
   {
       res.status(401).send({error: 'please authenticate'})
   }
}

module.exports = auth