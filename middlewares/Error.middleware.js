const errormiddleware = (err, req, res, next) => {

    //sequence of parameter is also important in both error and normal middleware:

    //If a middleware has four parameters (i.e., err, req, res, next), Express treats it as an error-handling middleware.
    // If a middleware has three parameters (i.e., req, res, next), it’s a normal middleware (like a route handler).

    err.message ||= 'Error Found at Serverside';
    err.statusCode ||= 500;

    res.status(err.statusCode)
        .json({
            success: false,
            message: err.message
        })
}

//In default Error class there is no way to pass statusCode so we need to make our own class by inherit the properties of Error also:

//any error send by controller or in app.js will be detected by this error middleware present in end of out app.js

class error extends Error {
    constructor(msg, statusCode) {
        super(msg);//calling parent(Error) class constructor
        this.statusCode = statusCode;
    }
}

export { errormiddleware, error }