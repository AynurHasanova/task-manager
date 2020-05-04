const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    userName : String,
    password : String,
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model('User', userSchema);

const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport){
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy(
      function(username, password, done) {

        User.findOne({
          userName: username.toLowerCase()
        }, function(err, user) {

          // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false);

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false); 

            // all is well, return successful user
            return done(null, user);
        });
      }
    ));

}

module.exports.User = User;