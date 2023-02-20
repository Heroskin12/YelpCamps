// Creates a new object class to tell the app how to structure errors.
class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;