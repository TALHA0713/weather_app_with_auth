const mongoose = require("mongoose");

let userSchema = mongoose.Schema(
  {
    name: String,
    email: { type: String, unique:true},
    password: String,
    roles: [],
    is_admin:{
      type : Boolean,
      default : false
    },
    isVerified : {
      type : Boolean,
      default : false
    },
    token:{
      type: String,
      default:"",
    } ,
    address:{
      type:String,
    },
    number:{
      type:Number,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
