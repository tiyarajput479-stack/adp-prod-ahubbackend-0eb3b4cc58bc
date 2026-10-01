const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({},   {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'modified_at'
    },
    strict: false
}
);

const RequestModel = new mongoose.model('Requests', RequestSchema);

module.exports = RequestModel;