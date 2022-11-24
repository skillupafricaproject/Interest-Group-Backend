const nodemailer = require('nodemailer')

exports.genOTP = () =>{
    let otp = '';
    for(let i = 0; i<=3; i++){
    const randval = Math.round(Math.random()*9)
    otp += randval 
    }
    return otp;
}




// exports.sendMail = async (msg) => {
//     try{
//         await sgMail.send(msg)
//         console.log('message sent')
//     }catch(error){ 
//         console.error(error);
//         if(error.response){
//             console.log(error.response.body)
//         }
//     }
// };


exports.mailTransport = () => 
nodemailer.createTransport({
        // Service: "Gmail",
        host: "smtp.mailtrap.io",
        port: 2525,
        // secure: true,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
});

exports.emailTemplate = code => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
        <style>
        @media only screen and (max-width: 620px){
            h1{
                font=size: 20px;
                padding: 5px
            }
        }
        </style>
    </head>
    <body>
    <div>
        <div style="max-width: 620px; margin: 0 auto; font-family:
        sans-serif; color: #272727;">
        <h1 style="background: #f6f6f6; padding: 10px; text-align:
        center; color: #272727; "> welcome!</h1>
        <p>your verification code is: </p>
        <p style="width: 80px; margin: 0 auto; font-weight: bold;
        text-align: center; background: #f6f6f6; border-radius: 5px;
        font-size: 25px;">${code}</p>
        </div>
    </div>
    </body>
</html>
    `
}

exports.plainEmailTemp = (heading, message) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
            <style>
            @media only screen and (max-width: 620px){
                h1{
                    font=size: 20px;
                    padding: 5px
                }
            }
            </style>
        </head>
        <body >
        <div>
            <div style="max-width: 620px; margin: 0 auto; font-family:
            sans-serif; color: #272727;">
            <h1 style="background: #f6f6f6; padding: 10px; text-align:
            center; color: #272727; "> ${heading}</h1>
            <p style="color: #272727; text-align: center;">${message}</p>
        </div>
        </body>
    </html>
    `
}

