require('dotenv').config()
const  nodemailer = require('nodemailer');


const mailTransport = nodemailer.createTransport({
    //service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MT_USERNAME,
      pass: process.env.MT_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});



mailTransport.verify(function(error, success){
    if(error){
        console.log(error)
    } else {
        console.log('ready to take messages')
    }
})

// //define the email options
// const mailOptions = {
//     from: 'Noreply <hello@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message

//     //html;
// }

// // Actually send the email
// await transporter.sendMail(mailOptions);

// // const sendEmail = async options =>{
// //     //Create a transporter
    
// //     //return true
// // }

module.exports = mailTransport;