const mongoose = require('../utils/database').getMongoose();
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');


const userSchema = new Schema({
    name: String,
    facebookId: String,
    googleId: String,
    email: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    mobile: String,
    profile_image: String,
    plan: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    active: {
        type: Boolean,
        default: false
    },
    followers: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    },
    about: String,
    headline: String,
    type: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    saved_wilts: {
        type: [String],
        default: []
    }
}, {timestamps: true});

userSchema.pre('save', function (next) {
    let user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});


userSchema.methods.comparePassword = (givenPassword, dbPassword, cb) => {
    if (givenPassword === dbPassword) {
        cb(null, true)
    } else {
        bcrypt.compare(givenPassword, dbPassword, function (err, isMatch) {
            if (err) {
                return cb(err);
            }
            cb(null, isMatch);
        });
    }
};

userSchema.statics.findOneOrCreate = (user, condition, callback) => {
    user.findOne({ email: condition.email}, (err, result) => {
        return result ? callback(err, result) : user.create(condition, (err, result) => { return callback(err, result) })
    })
};

module.exports = mongoose.model('User', userSchema);