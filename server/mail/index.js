import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",        // always literally "resend"
    pass: process.env.MAIL_SECRET,  
  },
});

export const sendMail = (details) => {
  return new Promise(async (resolve, reject) => {
    try {
      let done = await transporter.sendMail({
        from: "YooChat <onboarding@resend.dev>", 
        ...details,
      });
      resolve(done);
    } catch (err) {
      reject({
        status: 500,
        message: "Email Send Failed",
      });
    }
  });
};
