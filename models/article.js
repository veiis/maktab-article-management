const mongoose = require('mongoose');

let articleSchema = mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    author: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true
    },
    picture: {
        type: String,
        require: true,
        default: 'null'
    },
    date: {
        type: String,
        default: new Date().toISOString().slice(0, 10)
    }
});

module.exports = mongoose.model('Article', articleSchema);