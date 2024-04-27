const mongoose = require("mongoose");

const media = new mongoose.Schema({
  profile_pics: [
    {
      data: Buffer,
      contentType: String
    },
  ],
  attachments: [
    {
      data: Buffer,
      contentType: String,
      filename: String
    },
  ]
});

const Media = mongoose.model('media', media);

module.exports = Media;