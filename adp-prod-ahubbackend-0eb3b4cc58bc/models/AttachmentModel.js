
const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
   requestId: String,
   name: String,
   data :String,
}, );

const AttachmentModel = new mongoose.model('Attachments',AttachmentSchema);

module.exports = AttachmentModel;
