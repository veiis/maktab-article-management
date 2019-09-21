const mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    author: {
        type: String,
        require: true,
    },
    article: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    date: {
        type: String,
        default: new Date().toISOString().slice(0, 10)
    }
});

module.exports = mongoose.model('Comment', commentSchema);