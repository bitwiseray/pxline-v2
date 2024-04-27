const mongoose = require("mongoose");

const media = new mongoose.Schema({
  loadType: { type: String, required: true }, 
  data: { type: Buffer, required: true }, 
  contentType: { type: String, required: true },
  createdAt: { type: Number }
});

const Media = mongoose.model('media', media);

module.exports = Media;