"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // host: "email-smtp.ap-southeast-1.amazonaws.com",
  // port: 587,
  // secure: false,
  // auth: {
  //   // TODO: replace `user` and `pass` values from <https://forwardemail.net>
  //   user: "",
  //   pass: "",
  // },
  // tls: {
  //   ciphers:'SSLv3'
  // }
  host: "",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: "noreply-midleware@kcic.co.id",
    pass: "kc1c",
  }
});

exports.testEmail = async (req, res) => {
  // send mail with defined transport object
  try {
    const info = await transporter.sendMail({
      from: 'do-not-reply@kcic.co.id', // sender address
      to: "ivan@kapzet.id", // list of receivers
      subject: "Hello", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    res.status(200).send({
      message: ("Message sent: %s", info.messageId)
    });
    console.log("Message sent: %s", info.messageId);
  } catch (e) {
    console.log(e.message);
    res.status(500).send(e.message);
  }
  
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}