const nodemailer = require("nodemailer");
require("dotenv").config();

    const sendMail = async (name, email, id) => {
        try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
            },
        });
        const mailOption = {
            from: process.env.EMAIL,
            to: email,
            subject: "for Mail verify",
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Account Verification</h2>
            <p style="color: #555;">Hello ${name},</p>
            <p style="color: #555;">Welcome to our platform! Please click the link below to verify your account:</p>
            <div style="text-align: center;">
                <a href="http://127.0.0.1:3000/verify?id=${id}" style="background-color: #3498db; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Your Account</a>
            </div>
            <p style="color: #555;">If you did not create this account, please disregard this email.</p>
            </div>
        </div>
        `
        };
        transporter.sendMail(mailOption, function (err, info) {
            if (err) {
            console.log(err);
            } else {
            console.log("ready for message", info.response);
            console.log("success");
            }
        });
        } catch (err) {
        console.log(err);
        }
    };
    
    const sendResetPasswordMail = async (name, email, token) => {
        try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
            },
        });
        const mailOption = {
            from: process.env.EMAIL,
            to: email,
            subject: "for Reset Password",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="color: #555;">Hello ${name},</p>
                <p style="color: #555;">You have requested to reset your password. Click the link below to reset your password:</p>
                <div style="text-align: center;">
                <a href="http://127.0.0.1:3000/forget-password?token=${token}" style="background-color: #3498db; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
                </div>
                <p style="color: #555;">If you did not request this, please ignore this email.</p>
            </div>
            </div>
        `
        };
        transporter.sendMail(mailOption, function (err, info) {
            if (err) {
            console.log(err);
            } else {
            console.log("ready for message", info.response);
            console.log("success");
            }
        });
        } catch (err) {
        console.log(err);
        }
    };
    
    module.exports = {
        sendMail,
        sendResetPasswordMail
      };