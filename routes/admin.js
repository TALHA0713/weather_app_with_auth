    const express = require("express");
    const admin_router = express.Router();
    const bcrypt = require("bcryptjs");
    const User = require("../models/user");
    const random = require("randomstring");
    const {  sendMail,sendResetPasswordMail} = require("./sendmail.js");
    require("dotenv").config();

//     const adminLogin = async(req,res)=>{
//         try{
//             res.render('admin/login')
//         }
//         catch(err){
//             console.log(err)
//         }
//     }
//    admin_router.get("/admin/login",adminLogin);
//    admin_router.get("*",async(req,res)=>{
//     res.redirect("/admin")
//    });


    admin_router.get("/logout", async (req, res) => {
    req.session.user = null;
    return res.redirect("login");
    });

    admin_router.get("/login", (req, res) => {
    const message = req.query.message;
    res.render("login",{layout:"layouts/admin.ejs",message: message ? message : "" });
    });

    admin_router.post("/login", async (req, res) => {
    let user = await User.findOne({ name: req.body.email });
    if (!user?._id) {
        return res.redirect("/login?message=User does not exist");
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (validPassword) {
        req.session.user = user;
        if (user?.isVerified=== true) {  
            if(user?.is_admin===true){
                return res.redirect("/dashboard");
            }
            else{
                req.session.id = user._id;
                return res.render("login", {layout:"layouts/log_reg.ejs", message: "you are not admin" }); 
            }
        } else {
        return res.render("login", {layout:"layouts/log_reg.ejs", message: "Please first verify your account" });
        }
    } else {
        return res.redirect("login?message=User does not exist");
    }
    });

    

    admin_router.get("register", (req, res) => {
    const message = req.query.message;
    res.render("admin/register",{ layout:"layouts/log_reg.ejs",message: message ? message : "" })
    });



admin_router.post("admin/register", async (req, res) => {

    const allowedEmail = "nottalha07@gmail.com";
    if (req.body.email !== allowedEmail) {
        return res.render("register", {
            layout: "layouts/log_reg.ejs",
            message: "Registration is not allowed with this email address."
        });
    }

    let user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    sendMail(user.name, user.email, user._id);
    res.render("login", {
        layout: "layouts/log_reg.ejs",
        message: "Your Account is being Registered. Please check your Mail and verify it."
    });
});




    admin_router.get("/verify", async (req, res) => {
    await veryMail(req);
    res.render("admin/verified_mail",{layout:"layouts/404.ejs"});
    });
    
    admin_router.get("/forget-password", async (req, res) => {
    pToken(req, res);
    });
    admin_router.post("admin/forget-password", async (req, res) => {
    resetPassword(req, res);
    });

    admin_router.get("/forget", async (req, res) => {
    try {
        res.render("admin/forget", {layout:"layouts/log_reg.ejs", message: "" });
    } catch (err) {
        console.log(err.message);
    }
    });
    admin_router.post("admin/forget", async (req, res) => {
    try {
        email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user?.email) {
        if (user?.isVerified === false) {
            res.render("admin/forget", {layout:"layouts/log_reg.ejs",
            message:
                "this email is not verify plz first go to Your account and verify it",
            });
        } else {
            if(user?.is_admin===true){
            const randomstring = random.generate();
            user.token = randomstring;
            user.save();
            sendResetPasswordMail(user.name, user.email, randomstring);
            res.render("admin/forget", {layout:"layouts/log_reg.ejs",
            message: "plz check your email to reset password",
            });
            }
            else{
                res.render("admin/forget",{message: "you are not admin" });
            }
            
        }
        } 
        else {
        res.render("admin/forget",{message: "this email is not exist" });
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
    // console.log('hi');
    
    };

    const pToken = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData?._id) {
        res.render("admin/forget-password", {id:tokenData._id, layout:"layouts/forget.ejs",message:""});
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
        res.render("admin/forget-password",{layout:"layouts/forget.ejs", message:"same password plz try different one"});
        } else {
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(userId, {
            password: securePassword,
            token: "",
        });
        res.render("admin/updated",{layout:"layouts/404.ejs"});;
        }
    } catch (error) {
        console.error(error);
        return res.render("admin/forget-password",{message:"your mail is not correct"});
    }
    };

    module.exports = admin_router;
