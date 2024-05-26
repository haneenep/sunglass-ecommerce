const createError = (status,message) => {
    const error = new Error();
    error.status = status || 500;
    error.message = message || "Something went wrong";
    return error;
}

module.exports = {createError};