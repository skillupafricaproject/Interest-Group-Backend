const  nodemailer = require('nodemailer');

const sendEmail = async options =>{
    //Create a transporter
    const transporter = nodemailer.createTransport({
        //service: "Gmail",
        host: "smtp.mailtrap.io",
        port: 2525,
        // secure: true,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
    });

    //define the email options
    const mailOptions = {
        from: 'Noreply <hello@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message

        //html;
    }

    // Actually send the email
    await transporter.sendMail(mailOptions);
    //return true
}

module.exports = sendEmail;