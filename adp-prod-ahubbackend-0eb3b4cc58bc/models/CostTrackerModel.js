
const mongoose = require('mongoose');

const CostTrackerSchema = new mongoose.Schema({}, {strict: false});

const CostTrackerModel = new mongoose.model('CostTracker',CostTrackerSchema);

module.exports = CostTrackerModel;
