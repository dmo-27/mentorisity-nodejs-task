const mongoose = require('mongoose');


const connectDB = async () => {
    mongoose.connect("mongodb://localhost:27017/sessions", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log("MONGO Connected ")
    }).catch((err) => {
        console.log(err)
    })
}

module.exports = connectDB;