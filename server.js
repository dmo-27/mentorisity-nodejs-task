const express = require('express');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const connectDB = require('./config/db');
const UserModel = require("./models/User");
const User = require('./models/User');
const bcrypt = require('bcryptjs');


const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

const store = new MongoDBSession({
    uri:"mongodb://localhost:27017/sessions",
    collection:"mySessions",

})

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



const sessionMiddleware = session({
  secret: 'key-that-will-sign-cookie',
  resave: false,
  saveUninitialized: false,
  store: store,
});

app.use(sessionMiddleware);

const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }
}


app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/login",async (req, res) => {
  
    const{email,password} = req.body;
    const user = await UserModel.findOne({email});
    if(!user){
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.redirect("/login");
    }
    req.session.isAuth = true;
    res.redirect('/dashboard');
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await UserModel.findOne({ email });

        if (user) {
            return res.redirect('/register'); 
        }

        const hashPass = await bcrypt.hash(password,12);

        user = new UserModel({
            username,
            email,
            password:hashPass
        });

        await user.save(); 
        res.redirect('/login');
    } catch (error) {
      
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

app.use("/dashboard", isAuth, sessionMiddleware);

app.get("/dashboard",isAuth,(req,res)=>{
    res.render("dashboard");
})



app.post("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/');
    })
   
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
