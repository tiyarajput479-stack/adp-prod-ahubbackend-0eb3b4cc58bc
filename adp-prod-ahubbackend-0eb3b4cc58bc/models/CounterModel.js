const mongoose = require('mongoose');

// A simple named-counter collection used to hand out sequential business IDs
// atomically. Each document represents one sequence (e.g. `intakeOppId`).
const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // sequence name
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

/**
 * Atomically increment (and lazily create) a named counter, returning the next
 * value. Because `findOneAndUpdate` with `$inc` is a single atomic operation,
 * two concurrent requests can never receive the same number.
 *
 * @param {string} name - The sequence name.
 * @returns {Promise<number>} The next sequence value.
 */
CounterSchema.statics.next = async function next(name) {
  const doc = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).exec();
  return doc.seq;
};

const CounterModel = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

module.exports = CounterModel;
