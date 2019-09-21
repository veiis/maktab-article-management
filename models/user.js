const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    profilePic: {
        type: String,
        require: true,
        default: null
    },
    phone: {
        type: String,
        require: true,
        unique: true
    },
    role: {
        type: String,
        default: 'user'
    }
});

module.exports = mongoose.model('User', userSchema);