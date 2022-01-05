const mongoose = require('mongoose')

const LoginData = mongoose.Schema({
    Username:{
        type: String,
        required: true
    },
    Password:{
        type: String,
        required: true
    },
    UserType:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('LoginDatas', LoginData);