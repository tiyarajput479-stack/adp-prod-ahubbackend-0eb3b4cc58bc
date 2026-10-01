const { model, Schema } = require('mongoose');

const roleSchema = new Schema({
  role: String,
    accessPages: String,
  status: String,
  createdBy: String,
  time: Date

}, { versionKey: false });

const Role = model('Roles', roleSchema);


module.exports = { Role };