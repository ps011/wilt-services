const mongoose = require('../utils/database').getMongoose();
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
    email: String
    username:  String,
    password: String,
});

module.exports = mongoose.model('User', userSchema);
