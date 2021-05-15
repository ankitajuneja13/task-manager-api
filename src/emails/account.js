
const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email,name) =>{
    sgMail.send({
        to: email,
        from: 'ankitajuneja360@gmail.com',
        subject: 'Thanks for joining in !',
        text: `Welcome to the app ${name}`
    
    }) 
} 


const sendCancelEmail = (email,name) =>{
    sgMail.send({
        to: email,
        from: 'ankitajuneja360@gmail.com',
        subject: 'cancel activation!',
        text: ` Goodbye ${name}. Is there anything we could do to keep you onboard? We would like to hear your feedback`
    
    }) 
} 

module.exports={                         //sending it as obj
    sendWelcomeEmail,
    sendCancelEmail
}