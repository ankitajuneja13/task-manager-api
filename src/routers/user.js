const express= require('express')
const User=require('../models/user')
const auth = require('../middleware/auth')
const router=new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')


router.post('/users', async (req,res)=>{
    
    const user = new User(req.body)
     

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()   //custom method define in user.js model 
        res.status(201).send({user,token})
    }
    catch (e) {
        res.status(400).send(e)
    }

    // user.save().then(()=>{               //promise chaining method
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})


router.post('/users/login', async(req,res) =>{
    try{
                const user= await User.findByCredentials(req.body.email, req.body.password)  // custom method
                const token = await user.generateAuthToken()   //small user bcz dealing with single instance


                res.send({user, token})
    }catch(e){
              res.status(400).send(e)
    }
})


router.post('/users/logout', auth, async(req,res) =>{
    try{
               req.user.tokens = req.user.tokens.filter((token)=>{           //here token is obj with id and token attributes 
                   return token.token !== req.token                           //we use filter to remove the token in tokens array which is used, return true if it is diff       

               })
               await req.user.save()

               res.send()

    }catch(e){
              res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req,res) =>{
    try{
               req.user.tokens = []      
               
               await req.user.save()

               res.status(200).send()

    }catch(e){
              res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res)=>{       //auth is middleware fxn

    
             res.send(req.user)           //as we have saved it while auth 
})


router.patch('/users/me' ,auth,  async(req,res) =>{
    const updates = Object.keys(req.body)                              //returns an array of strings
    const allowedUpdates= ['name', 'email','password','age']
    const isValidOper = updates.every((update)=> allowedUpdates.includes(update))      //shorthand for arrow fxn still returning value
                                                       //every is going to run a fxn for every item in array
    if(!isValidOper)
    {
        return res.status(400).send({error : 'Invalid updates'})
    }

     try{
       

        updates.forEach((update)=> req.user[update] = req.body[update] )   //need to this way to get middeleware working
                           //bracket notation not user.name bcz we are accessing dynamically from the strings array of updates)
                 
            //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true ,runValidators :true})
        
            await req.user.save()   

             res.send(req.user)

     }catch(e){
          res.status(400).send(e)
     }
})

router.delete('/users/me' ,auth,  async(req,res) =>{
    try{
        // const user= await User.findByIdAndDelete(req.params.id)
        // if(!user)
        // {
        //     return res.send(404).send()
        // }

        await req.user.remove()         //just by adding middeleware same work as above 
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }

    
})


const upload = multer ({
     
      limits: {
          fileSize: 1000000                 //upto 1 mb
      },
      fileFilter(req, file, cb){             //cb means callback
           if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
           {
               return cb(new Error('Please upload an image'))
           }

           cb(undefined,true)
      }
})


router.post('/users/me/avatar' , auth, upload.single('avatar'),  async(req,res) =>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
} , (error,req,res,next)=>{
    res.status(400).send({error: error.message})
})


router.delete('/users/me/avatar' ,auth,  async(req,res) =>{
    
    req.user.avatar = undefined

        await req.user.save()         
        res.send()
    
})

router.get('/users/:id/avatar' ,async(req,res) =>{
          try{

            const user = await User.findById(req.params.id)

            if(!user || !user.avatar)
            {
                throw new Error()
            }

            res.set('Content-Type','image/png')    //set header for rendering image not binary data
            res.send(user.avatar)

          }catch(e){
              res.status(404).send()
          }

})

module.exports = router