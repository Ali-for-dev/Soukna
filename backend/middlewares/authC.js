
const User = require('../models/user')
const jwt = require("jsonwebtoken");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
/*
exports.isAuthenticatedUser = catchAsyncErrors( async(req , res , next) => {
    const { token } = req.cookies ;
    if(!token) {
        return next (new ErrorHandler('Login first to access this resource.',401))
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded); // Add this line
        req.user = await User.findById(decoded.id);
        console.log(req.user); // Add this line
        next();
    }catch(err){
        return next(new ErrorHandler('Invalid token.Please log in again .',401));
    }
});
*/
/*
//check if user is authenticated or not 
exports.isAuthenticatedUsere = catchAsyncErrors( async(req , res , next) => {

    const { token } = req.cookies ;

    if(!token) {
        return next (new ErrorHandler('Login first to access this resource.',401))
    }

    try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
    }catch(err){
        return next(new ErrorHandler('Invalid token.Please log in again .',401));
    }
});
*/
exports.isAuthenticatedUser = catchAsyncErrors( async(req , res , next) => {
    const { token } = req.cookies 
    if(!token) {
        return next (new ErrorHandler('Login first to access this resource.',401))
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = await User.findById(decoded.id);
        next();
    }catch(err){
        return next(new ErrorHandler('Invalid token.Please log in again .',401));
    }
});

// Gestion des utilisateurs v2

exports.authorizeRoles = (...roles) => {
    return(req , res , next) => {
        //console.log(req.user);        
        if(!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role})is not allowed to access this resource`,403));
        }
        next();
    };
};

/*
exports.authorizeRoles = (...roles) => {
    return(req , res , next) => {
        if(!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user ? req.user.role : 'Unknown'}) is not allowed to access this resource`,403));
        }
        next();
    };
};
*/