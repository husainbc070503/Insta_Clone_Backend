require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.MONGODB_URL;

const connectToDb = async () => {
    mongoose.set('strictQuery', false);
    try {
        await mongoose.connect(url, () => console.log('Connection established'));
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = connectToDb;