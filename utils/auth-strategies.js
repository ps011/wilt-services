const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
const user = require('../schemas/user.schema');


passport.serializeUser((user, cb) => {
    cb(null, user._id || user.id);
});

passport.deserializeUser((id, cb) => {
    user.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_KEY;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    user.findOne({
        $or: [
            {email: jwt_payload.userIdentifier},
            {username: jwt_payload.userIdentifier}
        ]}, function(err, result) {
        if (err) {
            return done(err, false);
        }
        if (result) {
            return done(null, result);
        } else {
            return done(null, false);
        }
    });
}));

passport.use(new LocalStrategy( async (userIdentifier, password, cb) => {
    try{
        const result = await user.findOne({
            $or: [
                {email: userIdentifier},
                {username: userIdentifier}
            ]});
        if (result) {
            result.comparePassword(password, result.password, (err, isMatch) => {
                if (isMatch && !err) {
                    return cb(null, result);
                } else {
                    return cb(null, false);
                }
            });
        } else {
            return cb(null, false);
        }
    } catch (e) {
        return cb(e);
    }
}));

// passport.use(new FacebookStrategy({
//         clientID: process.env.FACEBOOK_APP_ID,
//         clientSecret: process.env.FACEBOOK_APP_SECRET,
//         callbackURL: "/users/facebook/callback",
//         profileFields: ['id', 'displayName', 'email']
//     },
//     function(accessToken, refreshToken, profile, cb) {
//         user.findOneOrCreate(user, { facebookId: profile.id, name: profile.displayName, email: profile.emails[0].value }, function (err, user) {
//             return cb(err, user);
//         });
//         cb(null, profile);
//     }
// ));

// passport.use(new GoogleStrategy({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "/users/google/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//         user.findOneOrCreate(user, { googleId: profile.id , email: profile.emails[0].value }, function (err, user) {
//             return done(err, user);
//         });
//     }
// ));


const isEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

module.exports = passport;