// A function to check errors on Async functions.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}