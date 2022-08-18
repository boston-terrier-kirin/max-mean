const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
});

module.exports = mongoose.model('Post', postSchema);
