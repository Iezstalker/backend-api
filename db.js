const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/banao";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI);
    console.log("Connected Successfully!");
}

module.exports = connectToMongo;