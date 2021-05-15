const express= require('express')
const Task=require('../models/task')

const auth= require('../middleware/auth')
const router=new express.Router()



router.post('/tasks', auth , async (req,res)=>{
    
    //const task = new Task(req.body)

    const task = new Task({                               
        ...req.body,                                //setting relationship
        owner: req.user._id
    })

    try{
            await task.save()
            res.status(201).send(task)
    }
    catch(e)
    {
        res.status(400).send(e)
    }
  
})


// get /tasks?completed=false   query string use
// get /tasks?limit=2&skip=3
// get /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req,res)=>{
    const match={}
    const sort={}
    if(req.query.completed)                     //if not specified return all
    {
        match.completed = req.query.completed === 'true'   //need to compare to true so that it will return boolean instead of string

    }

    if(req.query.sortBy)
    {
        const parts= req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'? -1 :1   //grabbing the property user wants to sort on like createdAt, completed etc

                                                      // -1 means desc , 1 means asc by default 
    } 

    try{
        // const tasks= await Task.find({owner: req.user._id})    other way to do
        await req.user.populate({
            path : 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort

            }
        }).execPopulate()
         res.send(req.user.tasks)
    }
    catch(e)
    {
        res.status(500).send()
        
    }
})


router.get('/tasks/:id', auth, async  (req,res)=>{
  const _id= req.params.id

  try{
        // const task= await Task.findById(id)
        const task = await Task.findOne({ _id, owner: req.user._id})    // first _id represents task id
         if(!task)
      {
          return res.send(404).send()
      }
      res.send(task)

}
catch(e)
{
    res.status(500).send() 
}
})



router.patch('/tasks/:id' ,auth, async(req,res) =>{
    const updates = Object.keys(req.body)                              
    const allowedUpdates= ['description' ,'completed']
    const isValidOper = updates.every((update)=> allowedUpdates.includes(update))      
                                                       
    if(!isValidOper)
    {
        return res.status(400).send({error : 'Invalid updates'})
    }

     try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

            //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new : true ,runValidators :true})
          
            if(!task)
             {
                 return res.status(404).send()
             }
             
        updates.forEach((update)=> task[update] = req.body[update] ) 
        await task.save() 


             res.send(task)

     }catch(e){
          res.status(400).send(e)
     }
})

router.delete('/tasks/:id' , auth, async(req,res) =>{
    try{
        const task= await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task)
        {
            return res.send(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }

    
})

module.exports = router