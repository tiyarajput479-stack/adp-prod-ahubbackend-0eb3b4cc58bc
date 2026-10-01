

const mongoose = require('mongoose');

const ResourceSchema= new mongoose.Schema({}, {strict:false});

const NewResourceTrackerModel = new mongoose.model('ResourceTracker', ResourceSchema);

module.exports = { NewResourceTrackerModel};