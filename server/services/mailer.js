const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config({ path: "../config.env" });
sgMail.sendApiKey(process.env.SG_KEY);

const sendSGMail = async ({
  recipient,
  sender,
  subject,
  html,
  text,
  attachment,
}) => {
  try {
    const form = sender || "contact@codingmonk.in";

    const msg = {
      to: recipient,
      from: from,
      subject,
      html: html,
      text: text,
      attachment,
    };

    return sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

exports.sendEmail = async (args) => {
  if (process.env.NODE_ENV === "development") {
    return new Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};
