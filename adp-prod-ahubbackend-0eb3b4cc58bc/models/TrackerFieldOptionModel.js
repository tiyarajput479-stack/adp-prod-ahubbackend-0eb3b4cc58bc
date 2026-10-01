const mongoose = require('mongoose');

/**
 * Admin-managed dropdown values for the Resource Tracker columns
 * (Reporting Manager … iKare Project). Each document is a single allowed
 * value for one field, e.g. { field: "Role", value: "GenAI Developer" }.
 */
const TrackerFieldOptionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true, index: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

// A value is unique within a field (case-sensitive as stored).
TrackerFieldOptionSchema.index({ field: 1, value: 1 }, { unique: true });

const TrackerFieldOptionModel = mongoose.model('TrackerFieldOption', TrackerFieldOptionSchema);

module.exports = { TrackerFieldOptionModel };
