const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('user');
module.exports = (passport) => {
    var opts ={}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = 'juuud';
    debugger
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findOne({id: jwt_payload._id}, (err, user) => {
        if (err) {
            return done(console.log('error is',err, false));
        }
            if (user) {
                return done(null, console.log('user is',user));
            } else {
                return done(null, false);
                // or you could create a new account
            }
        }); 
    }))
}