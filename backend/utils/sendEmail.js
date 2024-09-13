const nodemailer = require('nodemailer');


const sendEmail = async optionss => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
      });

      const message = {
        from:`${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: optionss.email,
        subject: optionss.subject,
        text: optionss.message
      }

      await transporter.sendMail(message)

}
module.exports = sendEmail;