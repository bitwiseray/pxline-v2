const mongoose = require("mongoose");

const media = new mongoose.Schema({
  loadType: { type: String, required: true }, 
  data: { type: Binary, required: true }, 
  contentType: { type: String, required: true },
});

const Media = mongoose.model('media', media);

module.exports = Media;