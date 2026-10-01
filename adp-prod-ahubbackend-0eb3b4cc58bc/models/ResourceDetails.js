
const mongoose = require('mongoose');

const ResourceSchema= new mongoose.Schema({}, {strict:false});

const ResourceDetailsModel = new mongoose.model('ResourceDetails', ResourceSchema);

module.exports = { ResourceDetailsModel};