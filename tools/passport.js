const localStrategy = require('passport-local').Strategy;
const USER = require('../models/user');
const database = require('../tools/database');

module.exports = (passport) => {
    passport.use(new localStrategy((username, password, done) => {
        USER.findOne({ username : username}, (err, user) => {
            if(err) {
                throw err;
            }
            if(!user) {
                return done(null, false, { message: 'User not found :('});
            }

            if(user.password == password) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Wrong Password! '});
            }
        });
    }));
};