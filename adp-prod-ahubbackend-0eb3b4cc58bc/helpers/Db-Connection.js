const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./logger');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.connection_url);

        logger.info('database.connected', { pid: process.pid });
    } catch (error) {
        logger.error('database.connection_failed', { pid: process.pid, error });
        process.exit(1)
    }
}




module.exports = connectDb;