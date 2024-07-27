const logger = (req, res, next) => {
    try {
        // Log the type of method, protocol, host, and original URL
        console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl} `);
        next();
    } catch (error) {
        // Pass any errors to the Express error handling middleware
        next(error);
    }
}

module.exports = logger;
