const mongoose = require('../utils/database').getMongoose();
const Schema = mongoose.Schema;

const wiltSchema = new Schema({
    compact: String,
    lengthy: String,
    visuals:  Array[String],
    userId: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wilt', wiltSchema);
