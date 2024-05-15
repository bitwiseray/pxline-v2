const multer = require('multer');
const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

async function clearTMP() {
  fs.rmSync('../tmp', { recursive: true, force: true });
  fs.mkdirSync('../tmp');
}

module.exports = { storage, clearTMP };