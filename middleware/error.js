const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {

    //console.log(err.name);
    
    let error = { ...err }

    error.message = err.message;

    console.log(err);

    //Mongoose bad objectId
    if (err.name === 'CastError'){
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    //Duplicate key error
    if (err.code === 11000){
        const message = 'Duplicate value entered';
        error = new ErrorResponse(message, 400);
    }

    //Validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500 ).json({
        success:false,
        error: error.message || 'Server Error'
    });
    
};

module.exports = errorHandler;