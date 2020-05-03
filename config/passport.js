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

let User = mongoose.model('User', userSchema);

module.exports = User;
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

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'userName',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, userName, password, done) {
        process.nextTick(function() {
        User.findOne({ 'userName' :  userName }, function(err, user) {
            if (err)
                return done(err);

            if (user) {
                console.log('This userName is already taken')
                return done(null, false, req.flash('signupMessage', 'This userName is already taken'));
            } else {
                var newUser = new User();
                newUser.userName = userName;
                newUser.password = newUser.generateHash(password);

                // it saves the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });    

        });
    }));

    passport.use(
        "local-login",
        new LocalStrategy(
          {
            usernameField: "userName",
            passwordField: "password",
            passReqToCallback: true,
          },
          function(req, userName, password, done) {
            User.findOne({ userName: userName }, function(err, user) {
              if (err) return done(err)
              console.log("user", user)
              console.log("password", password)

              if (!user)
                return done(null, false, req.flash("loginMessage", "User not found"))

              if (!user.validPassword(password))
                return done(
                  null,
                  false,
                  req.flash("loginMessage", "Wrong password")
                )
              return done(null, user)
            })
          }
        )
      )
}