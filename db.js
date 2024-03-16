const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
    let DB_URL = process.env.db;// here we are using the MongoDB Url we defined in our ENV file

    module.exports = async function connection() {
        try {
            await mongoose.connect(DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("Connected to database");
        } catch (error) {
            console.log(error);
        }
    }