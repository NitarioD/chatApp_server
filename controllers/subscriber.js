const { v4: uuidv4 } = require("uuid");
const isEmail = require("is-email");
const nodemailer = require("nodemailer");
const Subscriber = require("../models/subscriberModel");

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Outlook365",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "thescripturegracefoundation@outlook.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

//send a subscriber a mail
exports.mail = async (req, res) => {
  const email_addr = req.params.email_addr;
  const mail = req.body.mail;
  //send mail
  var mailOptions = {
    from: `"Ayobami Adunola" <thescripturegracefoundation@outlook.com>`,
    to: `${email_addr}`,
    subject: `You have a mail from the president of SGF`,
    text: "An inbox from the SGF",
    html: `<html><body><p>${mail}</p><p>Stay Blessed! 🕊️</p><footer><img src="cid:logo" style="width: 100vw; height: auto"><a href="${process.env.WEB_URL}:${process.env.CLIENT_PORT}/user/unsubcribe" style="color: red">unsubscribe</a></footer></body><br/></html>`,
    attachments: [
      {
        filename: "sgf-logo.png",
        path: __dirname + "/public/sgf-logo.png",
        cid: "logo",
      },
    ],
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error.message);
      return res.json({
        error:
          "There was an error trying to get you subscribed to our community. Please check your email address and try again.",
      });
    } else {
      console.log("Email sent:", info.response);
      return res.json({ ok: true });
    }
  });
};
//send all subscribers a mail
exports.mailAll = async (req, res) => {
  const mail = req.body.mail;
  const allMails = (await Subscriber.find({}).select("email")).map(
    (mail_addr) => mail_addr.email
  );
  //send mail
  var mailOptions = {
    from: `"Ayobami Adunola" <thescripturegracefoundation@outlook.com>`,
    to: allMails,
    subject: `You have a mail from the president of SGF`,
    text: "An inbox from the SGF",
    html: `<html><body><p>${mail}</p><p>Stay Blessed! 🕊️</p><footer><img src="cid:logo" style="width: 100vw; height: auto"><a href="${process.env.WEB_URL}:${process.env.CLIENT_PORT}/user/unsubcribe" style="color: red">unsubscribe</a></footer></body><br/></html>`,
    attachments: [
      {
        filename: "sgf-logo.png",
        path: __dirname + "/public/sgf-logo.png",
        cid: "logo",
      },
    ],
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error.message);
      return res.json({
        error: "There was an error trying to send this mail, try again later.",
      });
    } else {
      console.log("Email sent:", info.response);
      return res.json({ ok: true });
    }
  });
};
//send subscriber code to unsubscribe
exports.getCode = async (req, res) => {
  const email_addr = req.params.email_addr;
  //find subscriber with the mail
  try {
    const subscriber = await Subscriber.find({ email: email_addr });
    if (subscriber.length == 1) {
      //send mail
      var mailOptions = {
        from: `"Ayobami Adunola" <thescripturegracefoundation@outlook.com>`,
        to: `${email_addr}`,
        subject: `You have a mail from the president of SGF`,
        text: "An inbox from the SGF",
        html: `<html><body><p>Hello ${subscriber[0].fname},</p><p>Your unsubscribe code is <b>${subscriber[0].unsubscribe_code}</b></p><p>Stay Blessed! 🕊️</p><footer><img src="cid:logo" style="width: 100vw; height: auto"><a href="${process.env.WEB_URL}:${process.env.CLIENT_PORT}/user/unsubcribe" style="color: red">unsubscribe</a></footer></body><br/></html>`,
        attachments: [
          {
            filename: "sgf-logo.png",
            path: __dirname + "/public/sgf-logo.png",
            cid: "logo",
          },
        ],
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error.message);
          return res.json({
            error:
              "There was an error trying to get you subscribed to our community. Please check your email address and try again.",
          });
        } else {
          console.log("Email sent:", info.response);
          return res.json({ ok: true });
        }
      });
    } else {
      return res.json({ error: "Subscriber with this mail does not exist" });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.subscribe = async (req, res) => {
  const { fname, lname, email, phone } = req.body.details;
  const unsubscribe_code = uuidv4();

  //check if subscriber exists
  const subscriber = await Subscriber.find({ email });

  if (subscriber.length > 0) {
    return res.json({ error: "A subscriber with this mail already exists" });
  }
  try {
    //check if fname exists
    if (fname == "") {
      return res.json({ error: "Please enter your firstname" });
    }
    //check if lname exists
    if (lname == "") {
      return res.json({ error: "Please enter your lastname" });
    }
    //check if email is valid
    const emailValidate = isEmail(email) && email.split(".com").length == 2;
    if (!emailValidate) {
      return res.json({ error: "Please enter a valid email address" });
    }
    //check if phone number contains only numbers
    const isNumber = parseInt(phone.phone);
    if (isNumber.toString() == "NaN") {
      return res.json({ error: "Invalid phone number" });
    }

    const newSubscriber = new Subscriber({
      fname,
      lname,
      email,
      phone: "+" + phone.code + phone.phone,
      unsubscribe_code,
    });

    //send mail
    var mailOptions = {
      from: `Ayobami Adunola <thescripturegracefoundation@outlook.com>`,
      to: `${email}`,
      subject: `Dear ${fname}, welcome to the SGF community`,
      html: `<html><body><p>Hello ${fname},</p> <p> Ayobami Adunola, the president of the Scripture Grace Foundation, welcomes you to the family. Thank you for joining us!! We are happy to have you</p> 
    <p>There are different ways you can choose to function as a partner of the Scripture Grace Foundation. You can function in one or more ways. We need your prayers, suggestions, donations and volunteers for crusade activities.</p><p>You will be getting updates about our activities so that you can actively participate in any form you choose.</p> <p>Stay blessed! 🕊️</p><footer><img src="cid:logo"></footer></body><br/></html>`,
      attachments: [
        {
          filename: "sgf-logo.png",
          path: __dirname + "/public/sgf-logo.png",
          cid: "logo",
        },
      ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error.message);
        return res.json({
          error:
            "There was an error trying to get you subscribed to our community. Please check your email address and try again.",
        });
      } else {
        console.log("Email sent:", info.response);
        newSubscriber.save();
        return res.json({ ok: true });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.unsubscribe = async (req, res) => {
  const unsubscribeCode = req.body.unsubscribeCode;
  const email_addr = req.params.email_addr;
  const exists = await Subscriber.find({
    email: email_addr,
    unsubscribe_code: unsubscribeCode,
  });
  try {
    if (exists.length == 1) {
      await Subscriber.findOneAndDelete({
        email: email_addr,
        unsubscribe_code: unsubscribeCode,
      });
      return res.json({ ok: true });
    } else {
      return res.json({
        error:
          "This email and unsubscribe code do not match. Please confirm and try again",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.subcriberById = async (req, res, next, id) => {
  const subscriber = await Subscriber.findById(id).select("-unsubscribe_code");
  if (!subscriber) {
    res.status(400).json({ error: "Subscriber not found" });
  }
  req.subcriber_profile = subscriber;
  next();
};

exports.subscribers = async (req, res) => {
  const subscribers = await Subscriber.find({}).select("-unsubscribe_code");
  res.json({ subscribers });
};

exports.read = (req, res) => {
  return res.json(req.subcriber_profile);
};
