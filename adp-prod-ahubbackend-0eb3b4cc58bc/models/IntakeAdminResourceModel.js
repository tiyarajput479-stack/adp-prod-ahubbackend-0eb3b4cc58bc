const mongoose = require('mongoose');

const IntakeAdminResourceSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true, index: true },
    itemId: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

IntakeAdminResourceSchema.index({ resource: 1, itemId: 1 }, { unique: true });

const IntakeAdminResourceModel = mongoose.model('IntakeAdminResource', IntakeAdminResourceSchema);

module.exports = { IntakeAdminResourceModel };
