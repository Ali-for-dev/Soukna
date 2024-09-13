const product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');


module.exports = (err ,req , res , next) => {
    err.statusCode = err.statusCode || 500 ;

    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION') {
        let error = {...err}

        error.message = err.message 

        //Mongoose id erreur (peut la trouver lorsque on envoi une requete pour avoir un produit qui n'existe pas )
        if(err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message , 400)
        }
        //Mongoose Validation Error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400)
        }

        //Handling Mongoose duplicate key errors
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message, 400)
        }

        //Handling wrong jwt error
        if(err.name === 'JsonWebTokenError'){
            const message = 'JSON web Token is invalid. try again !'
            error = new ErrorHandler(message, 400)
        }


        //Handling Expired jwt error
        if(err.name === 'TokenExpiredError'){
            const message = 'JSON web Token is expired. try again !'
            error = new ErrorHandler(message, 400)
        }


        res.status(err.statusCode).json({
            success: false ,
            message : error.message || 'Internal Server Error'  
        })
    }

    
}