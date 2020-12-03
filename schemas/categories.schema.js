const mongoose = require('../utils/database').getMongoose();
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: String,
});

module.exports = mongoose.model('Category', categorySchema);
