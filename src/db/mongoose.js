const mongoose =require('mongoose')


mongoose.connect(process.env.MONGODB_URL ,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false    // for no deprecation warning if use find method
})


// const me= new User({               // creat a model instance 
//     name: '  siya  ',                       
//     email:'SIiya@gmail.com ',
//     password: 'Password'


// })

// me.save().then((result)=>{
//     console.log(me)

// }).catch((error)=>{
//     console.log('Error', error)
// })



// const task1 = new Task({
//     description: 'Do exercise  ',
    
// })

// task1.save().then(()=>{
//     console.log(task1)
// }).catch((error)=>{
//     console.log(error)
//  })