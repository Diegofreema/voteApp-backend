const nodemailer = require('nodemailer');

const sendEmail = async (subject, message, email, sent_from) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const options = {
    from: sent_from,
    to: email,

    subject: subject,
    html: message,
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log('sending error', err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
