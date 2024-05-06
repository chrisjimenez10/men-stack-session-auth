const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo"); //Module that will allow us to store session data in MongoDB Database

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const isSignedIn = require("./middleware/is-signed-in");
const passUserToView = require("./middleware/pass-user-to-view");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
const authController = require("./controllers/auth"); //Importing the router variable should be placed AFTER the port variable is declared


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));

// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));

// Morgan for logging HTTP requests
app.use(morgan('dev'));

// Middlware to use the session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ //We need to add this property to the session middleware statement to store data into the MongoDB Database
    mongoUrl: process.env.MONGODB_URI,
  })
}));
app.use(passUserToView);

//Routes
    //GET
app.get("/", (req, res)=>{
        res.render("index.ejs");
    // res.render("index.ejs", {
    //   user: req.session.user, // Here, we are passing a variable with the value of "req.session.user", so that we can reflect the sign-in status of the user (we are accessing the value we defined in the sign-in route handler for the "req.session" object)
    // });
});

app.get("/vip-lounge", isSignedIn, (req, res)=>{ //Route Controllers can accept any number of handler functions, so we can siply add directly before the (req, res) callback function
    res.send(`Welcome to the Party ${req.session.user.username}`)
});
  //Transfer to file stored in "authController" variable and read routes in that location - for routes that start with "/auth"
app.use("/auth", authController);









//Start Express Server
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});


