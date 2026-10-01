const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  userName: String,
  name: String,
  designation: String,
  email: String,
  role:String,
  active: String,
  status: String,

}, { versionKey: false });

const User = model('User', userSchema);


module.exports = { User };