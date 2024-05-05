//Import
const express = require("express");
const router = express.Router(); //Router() is an Express built-in object we can use to create routers
const User = require("../models/user");
const bcrypt = require("bcrypt"); //This is bcrypt, which is a npm package that helps store password text strings securely ("salting" refers to the number of characters that will be generated for the newly-decrypted password - it is a number that takes the second argument in the hashSync() function)

//Routes
    //Sign-Up Show Page
router.get("/sign-up", (req, res)=>{
    res.render("auth/sign-up.ejs"); 
});

    //Create User Route
router.post("/sign-up", async (req, res)=>{
    const userInDatabase = await User.findOne({username: req.body.username}); //Authentication is more complex than just creating a regular document: We need to ENSURE that the username does not exists already in the database - so we need to use the "findOne()" method and specifying to find the property: value pair we received from the user
    if(userInDatabase){
        return res.send("Username already taken");
    }
    if(req.body.password !== req.body.confirmPassword){
        return res.send("Password and Confirm Password must match");
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10); //Here, we are storing the newly decrypted password text ("hashed") to a variable - the operation is bcrypt.hashSync(user-input, salting(number))
    req.body.password = hashedPassword;
    const user = await User.create(req.body);

    //We can initialize a session and login automatically after the user signs-up by using the same code that STARTS a session on our Database and resolve the request by redirecting the user to the landing page 
    req.session.user = {
        username: user.username,
    };
    req.session.save(()=>{
        res.redirect("/");
    })
});

    //Sign-In Show Page
router.get("/sign-in", (req, res)=>{
    res.render("auth/sign-in.ejs");
});

    //Sign-In Route
router.post("/sign-in", async (req, res)=>{
    // First, get the user from the database
    const userInDatabase = await User.findOne({username: req.body.username});
    if(!userInDatabase){
        return res.send("Login Failed. Please try again.");
    }

    // User is found in the database, so time to test their password with bcrypt (if provided password matches password in database)
    const validPassword = bcrypt.compareSync( //The compareSync() method compares the two arguments passed to it
        req.body.password,
        userInDatabase.password
    );
    if(!validPassword){
        return res.send("Login failed. Please try again");
    }

    // If the sign-in information provided by the user is correct and passes all validations from above, then this says: "Time to make a session!"
    // We need to AVOID storing the password (even in hashed format) in the session
    // If there is other data we want to save to "req.session.user" - then we do it inside of the object
    req.session.user = {
        username: userInDatabase.username,
    };
    req.session.save(()=>{ // By using the save() method on the initialized session we "save" it into the Database, then we add a callback function to convert it into an asynchronous operation - MUST do this if we are storing the session data in the MongoDB Database
        res.redirect("/");
    })
});

    //Sign-Out from Session
router.get("/sign-out", async (req, res)=>{
    req.session.destroy(()=>{ // If we have our session data being stored in the Database, then we convert the "req.session.detroy()" method into an asynchronous operation by adding a callback function 
        res.redirect("/");
    });
});


module.exports = router;