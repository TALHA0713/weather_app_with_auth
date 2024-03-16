const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const random = require("randomstring");
const {  sendMail,sendResetPasswordMail} = require("./sendmail.js");
// const nodemailer = require("nodemailer");
require("dotenv").config();

    // const sendMail = async (name, email, id) => {
    //     try {
    //     const transporter = nodemailer.createTransport({
    //         host: "smtp.gmail.com",
    //         port: 587,
    //         secure: false,
    //         requireTLS: true,
    //         auth: {
    //         user: process.env.EMAIL,
    //         pass: process.env.PASSWORD,
    //         },
    //     });
    //     const mailOption = {
    //       from: process.env.EMAIL,
    //       to: email,
    //       subject: "for Mail verify",
    //       html: `<p> hii  ${name} plz click here to <a href="http://127.0.0.1:3000/verify?id=${id}">Verify your Account</a> your mail </p>`,
    //     };
    //     transporter.sendMail(mailOption, function (err, info) {
    //         if (err) {
    //         console.log(err);
    //         } else {
    //         console.log("ready for message", info.response);
    //         console.log("success");
    //         }
    //     });
    //     } catch (err) {
    //     console.log(err);
    //     }
    // };
    
    // const sendResetPasswordMail = async (name, email, token) => {
    //     try {
    //     const transporter = nodemailer.createTransport({
    //         host: "smtp.gmail.com",
    //         port: 587,
    //         secure: false,
    //         requireTLS: true,
    //         auth: {
    //         user: process.env.EMAIL,
    //         pass: process.env.PASSWORD,
    //         },
    //     });
    //     const mailOption = {
    //       from: process.env.EMAIL,
    //       to: email,
    //       subject: "for Reset Password",
    //       html: `<p> hii  ${name} plz click here to <a href="http://127.0.0.1:3000/forget-password?token=${token}">Reset Password</a> your mail</p>`,
    //     };
    //     transporter.sendMail(mailOption, function (err, info) {
    //         if (err) {
    //         console.log(err);
    //         } else {
    //         console.log("ready for message", info.response);
    //         console.log("success");
    //         }
    //     });
    //     } catch (err) {
    //     console.log(err);
    //     }
    // };
    

router.get("/logout", async (req, res) => {
  req.session.user = null;
  return res.redirect("/login");
});

router.get("/login", (req, res) => {
  const message = req.query.message;
  res.render("login",{layout:"layouts/log_reg.ejs",message: message ? message : "" });
});

router.post("/login", async (req, res) => {
  let user = await User.findOne({ name: req.body.name });
  if (!user?._id) {
    return res.redirect("/login?message=User does not exist");
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (validPassword) {
    req.session.user = user;
    if (user?.isVerified=== true) {  
      return res.redirect("/weather");
    } else {
      return res.render("login", {layout:"layouts/log_reg.ejs", message: "Please first verify your account" });
    }
  } else {
    return res.redirect("/login?message=User does not exist");
  }
});

router.get("/register", (req, res) => {
  const message = req.query.message;
  res.render("register",{ layout:"layouts/log_reg.ejs",message: message ? message : "" })
});


router.post("/register", async (req, res) => {
  let user = new User(req.body);
  // console.log(user);
  const isUserExist = await User.findOne({ email: req.body.email });
  if (isUserExist?.email) {
    res.redirect("register?message=Email already exist")
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  await user.save();
  // console.log(user.name);
  // console.log(user.email);
  sendMail(user.name, user.email, user._id);
  res.render("login",{layout:"layouts/log_reg.ejs",message:"Your Account is being Registered Plz first Check your Mail and verify it"});

});


router.get("/verify", async (req, res) => {
  await veryMail(req);
  res.render("verified_mail",{layout:"layouts/404.ejs"});
});



router.get("/forget-password", async (req, res) => {
  pToken(req, res);
});
router.post("/forget-password", async (req, res) => {
  resetPassword(req, res);
});

router.get("/forget", async (req, res) => {
  try {
    res.render("forget", {layout:"layouts/log_reg.ejs", message: "" , id:"4834"});
  } catch (err) {
    console.log(err.message);
  }
});
router.post("/forget", async (req, res) => {
  try {
    email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user?.email) {
      if (user?.isVerified === false) {
        res.render("forget", {layout:"layouts/log_reg.ejs",
          message:
            "this email is not verify plz first go to Your account and verify it",
        });
      } else {
        const randomstring = random.generate();
        user.token = randomstring;
        user.save();
        sendResetPasswordMail(user.name, user.email, randomstring);
        res.render("forget", {layout:"layouts/log_reg.ejs",
          message: "plz check your email to reset password",
        });
      }
    } 
    else {
      res.render("forget",{message: "this email is not exist" });
    }

  } catch (err) {
    console.log(err.message);
  }
});

const veryMail = async (req, res) => {
  try {
    const updateData = await User.updateOne(
      { _id: req.query.id },
      { $set: { isVerified: true } }
    );
    console.log(updateData)
  
  } catch (err) {
    console.log(err);
  }
  console.log('hi');
  
};

const pToken = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData?._id) {
      res.render("forget-password", {id:tokenData._id, layout:"layouts/forget.ejs",message:""});
    } else {
      res.render("404",{layout: "layouts/404.ejs"});
    }
  } catch{
    res.render("404",{layout: "layouts/404.ejs"})
  }
};

const resetPassword = async (req, res) => {
  try {
    const newPassword = req.body.password;
    const userId = req.body.id;
    const user = await User.findById(userId);
    const passwordMatch = await bcrypt.compare(newPassword, user.password);
    if (passwordMatch) {
      res.render("forget-password",{layout:"layouts/forget.ejs", message:"same password plz try different one"});
    } else {
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(newPassword, salt);
      await User.findByIdAndUpdate(userId, {
        password: securePassword,
        token: "",
      });
      res.render("updated",{layout:"layouts/404.ejs"});;
    }
  } catch (error) {
    console.error(error);
    return res.render("forget-password",{message:"your mail is not correct"});
  }
};

module.exports = router;
