const mongoose = require('../utils/database').getMongoose();
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const wiltSchema = new Schema({
    compact: String,
    category: String,
    lengthy: String,
    visuals: [String],
    tags: [String],
    userId: String,
    username: String,
    private: Boolean,
    slug: { type: String, slug: "compact"},
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wilt', wiltSchema);
