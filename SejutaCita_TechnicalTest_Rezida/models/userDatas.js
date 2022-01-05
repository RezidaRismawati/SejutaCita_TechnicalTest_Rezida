const mongoose = require('mongoose')

const UserData = mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    Gender:{
        type: String,
        required: true
    },
    BirthDate:{
        type: Date,
        required: true
    },
    Username:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('UserDatas', UserData);