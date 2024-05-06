//Middleware to plug into route controller
const isSignedIn = (req, res, next)=>{
    if(req.session.user) return next(); //If user is authenticated, go to the next middleware function or operation
    res.redirect("/auth/sign-in"); //If user is NOT authenticated, redirect to sign-in page to become authenticated
};

module.exports = isSignedIn; //Exporting module to USE in our main server file