const express=require('express')
require('./db/mongoose')    //we dont need anything , just to ensure connectivity with db so not used var to store

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app=express()
const port= process.env.PORT 

// app.use((req,res,next)=>{                       // req , res have access to everything that route has, next will work as registering our middeleware

//     res.status(503).send('site under maintenance')

// })


app.use(express.json())   //parse incoming json data to an obj

app.use(userRouter)
app.use(taskRouter)


app.listen(port, ()=>{
    console.log('Server is up on port' + port)
})

