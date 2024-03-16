const express = require('express')
const path = require("path");
const ejs = require('ejs');
const ejsLayout = require("express-ejs-layouts");
const connection = require("./db");
const User = require("./models/user");
// const route = express.Router();
const dotenv = require('dotenv');
var cookieParser = require("cookie-parser");
var session = require("express-session");
const cors = require("cors");
dotenv.config()
const app = express()
const port = 3000

const newPath = path.join(__dirname,"public")
app.use(express.static(newPath));
app.set("view engine", "ejs");
app.set("views", "./views");
app.set("layout", "layouts/layouts.ejs");
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(cors());
app.use(ejsLayout);

app.use(
  session({
    secret: process.env.secret,
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);

app.use(require("./middlewares/middlewar"));

// app.use(require("./middlewares/siteSetting"));
app.use("/", require("./routes/auth"));
// app.use("/", require("./routes/admin"));

app.get('/', (req, res) => {
  res.render("home");
})

app.get('/about', (req, res) => {
    res.render('about')
  })

  app.get(
    "/weather",
    require("./middlewares/checkSessionAuth"),
    async (req, res) => {
      return res.render("weather");
    }
  );

  app.get("/cookie-test", (req, res) => {
    let views = req.cookies.views ? req.cookies.views : 0;
    views = Number(views) + 1;
    res.cookie("views", views);
    return res.send(`You Visited ${views} times`);
  });
  
  app.use((error, req, res, next) => {
    res.status(500).json({ error: error.message });
  });
  
  
  app.get("/dashboard",(req, res) => {
    return res.redirect("/users");
  });


  app.get('/users',(req,res)=>{
    // console.log("req made on"+req.url);
    User.find().sort({createdAt:-1})
      .then(result => { 
        res.render('index', {layout:"layouts/404.ejs", users: result ,title: 'Home' }); 
      })
      .catch(err => {
        console.log(err);
      });
  })
  
  
  
  app.get('/user/create',(req,res)=>{
    // console.log("GET req made on"+req.url);
    res.render('adduser',{layout:"layouts/404.ejs",title:'Add-User'});
  })
  
  
  app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    User.findById(id)
      .then(result => {
        res.render('details', {layout:"layouts/404.ejs", user: result, action:'edit',title: 'User Details' });
      })
      .catch(err => {
        console.log(err);
      });
  });
  
  
  app.get('/edit/:name/:action',(req,res)=>{
    const name = req.params.name;
    User.findOne({name:name})
      .then(result => {
        res.render('edit', { layout:"layouts/404.ejs",user: result ,title: 'Edit-User' });
      })
      .catch(err => {
        console.log(err);
      });
  })
  
    app.post('/user/create',(req,res)=>{
    const user = new User(req.body);
    user.save() 
      .then(result => {
        res.redirect('/users');
      })
      .catch(err => { 
        console.log(err);
      });
  
  })
  
  
  app.post('/edit/:id',(req,res)=>{
    User.updateOne({_id:req.params.id},req.body) 
      .then(result => {
        res.redirect('/users');
      })
      .catch(err => { 
        console.log(err);
      });
  
  })
  
  
  
  app.post('/users/:name',(req,res)=>{ 
    const name = req.params.name;
    // console.log(name);
    User.deleteOne({name:name})
    .then(result => {
      res.redirect('/users');
    })
    .catch(err => {
      console.log(err);
    });
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

let connection1 = async function db(){
  await connection();
}
connection1();
