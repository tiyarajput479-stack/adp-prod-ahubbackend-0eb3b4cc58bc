const { TrackerFieldOptionModel } = require('../models/TrackerFieldOptionModel');

/**
 * CRUD for Resource Tracker dropdown values. The frontend
 * (trackerFieldService.js) expects records shaped as { _id, field, value }
 * and drives the "Resource Fields" section in Administration.
 *
 *   GET    /trackerFieldOptions            -> all options
 *   GET    /trackerFieldOptions?field=Role -> options for one field
 *   POST   /trackerFieldOptions            -> { field, value }
 *   PUT    /trackerFieldOptions/:id         -> { field, value }
 *   DELETE /trackerFieldOptions/:id
 */

// The editable roster columns backed by an admin-managed value list. Kept in
// sync with TRACKER_FIELDS in the frontend trackerFieldService.js.
const SUPPORTED_FIELDS = new Set([
  'Reporting Manager',
  'Manager',
  'Type',
  'Stream',
  'Role',
  'Country',
  'Status',
  'Project/Product',
  'Group',
  'Finance Names',
  'iKare Project',
]);

const listTrackerFieldOptions = async (req, res) => {
  try {
    const field = String(req.query.field || '').trim();
    const query = field ? { field } : {};
    const docs = await TrackerFieldOptionModel.find(query)
      .sort({ field: 1, value: 1 })
      .lean()
      .exec();
    return res.status(200).json(docs);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to list tracker field options', error: error?.message });
  }
};

const createTrackerFieldOption = async (req, res) => {
  try {
    const input = req.body && typeof req.body === 'object' ? req.body : {};
    const field = String(input.field || '').trim();
    const value = String(input.value || '').trim();

    if (!field || !SUPPORTED_FIELDS.has(field)) {
      return res.status(400).json({ message: 'Unsupported or missing field' });
    }
    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    // Idempotent create: reuse the existing document when the value already
    // exists for the field so duplicates never surface a 500.
    const doc = await TrackerFieldOptionModel.findOneAndUpdate(
      { field, value },
      { $setOnInsert: { field, value } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .lean()
      .exec();

    return res.status(200).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to create tracker field option', error: error?.message });
  }
};

const updateTrackerFieldOption = async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!id) {
      return res.status(400).json({ message: 'Missing option id' });
    }

    const input = req.body && typeof req.body === 'object' ? req.body : {};
    const value = String(input.value || '').trim();
    const field = String(input.field || '').trim();

    if (field && !SUPPORTED_FIELDS.has(field)) {
      return res.status(400).json({ message: 'Unsupported field' });
    }
    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const update = field ? { field, value } : { value };
    const doc = await TrackerFieldOptionModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    )
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).json({ message: 'Tracker field option not found' });
    }

    return res.status(200).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to update tracker field option', error: error?.message });
  }
};

const deleteTrackerFieldOption = async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!id) {
      return res.status(400).json({ message: 'Missing option id' });
    }

    const deleted = await TrackerFieldOptionModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) {
      return res.status(404).json({ message: 'Tracker field option not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to delete tracker field option', error: error?.message });
  }
};

module.exports = {
  listTrackerFieldOptions,
  createTrackerFieldOption,
  updateTrackerFieldOption,
  deleteTrackerFieldOption,
};
