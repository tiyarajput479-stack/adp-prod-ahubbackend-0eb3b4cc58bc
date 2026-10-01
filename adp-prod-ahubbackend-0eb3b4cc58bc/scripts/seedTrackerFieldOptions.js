/**
 * Seed script for the Resource Tracker dropdown field options.
 *
 * Reads the existing roster (`ResourceTracker` collection) and populates the
 * `trackerfieldoptions` collection with the distinct values found for each
 * admin-managed column (Reporting Manager … iKare Project). This bootstraps the
 * Administration → Resource Fields lists from the data already in the tracker.
 *
 * Usage (from the AhubBackend folder):
 *   node scripts/seedTrackerFieldOptions.js            -> inserts missing values (keeps existing)
 *   node scripts/seedTrackerFieldOptions.js --replace  -> clears the options collection first
 *
 * Requires `connection_url` to be set in the .env file (same as the app).
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { NewResourceTrackerModel } = require('../models/NewResourceTrackerModel');
const { TrackerFieldOptionModel } = require('../models/TrackerFieldOptionModel');

// The editable roster columns backed by an admin-managed value list. Kept in
// sync with SUPPORTED_FIELDS in TrackerFieldOptionController and TRACKER_FIELDS
// in the frontend trackerFieldService.js.
const TRACKER_FIELDS = [
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
];

// Roster placeholder names that should never become dropdown values.
const PLACEHOLDER_VALUES = new Set(['vacant', 'offered', 'na', 'n/a', '']);

const isPlaceholder = (value) => PLACEHOLDER_VALUES.has(String(value).trim().toLowerCase());

async function seed() {
  const replace = process.argv.includes('--replace');

  if (!process.env.connection_url) {
    console.error('Missing `connection_url` in environment (.env). Aborting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.connection_url);
    console.info('Connected to database.');

    const rows = await NewResourceTrackerModel.find({}).lean().exec();
    console.info(`Loaded ${rows.length} roster records.`);

    // Collect distinct, non-placeholder values per field.
    const valuesByField = {};
    TRACKER_FIELDS.forEach((field) => {
      valuesByField[field] = new Set();
    });
    rows.forEach((row) => {
      TRACKER_FIELDS.forEach((field) => {
        const value = String(row?.[field] ?? '').trim();
        // The Status/Type/Country placeholders (Vacant/Offered/NA) are real
        // status values but noise for Name-like fields; only skip placeholders
        // for the free-text people/project fields, keep them for enums.
        const keepPlaceholders = ['Type', 'Status', 'Country'].includes(field);
        if (!value) return;
        if (!keepPlaceholders && isPlaceholder(value)) return;
        valuesByField[field].add(value);
      });
    });

    if (replace) {
      const { deletedCount } = await TrackerFieldOptionModel.deleteMany({});
      console.info(`Cleared existing options (${deletedCount} documents removed).`);
    }

    // Build one upsert per (field, value) so re-running never duplicates.
    const operations = [];
    TRACKER_FIELDS.forEach((field) => {
      Array.from(valuesByField[field])
        .sort((a, b) => a.localeCompare(b))
        .forEach((value) => {
          operations.push({
            updateOne: {
              filter: { field, value },
              update: { $setOnInsert: { field, value } },
              upsert: true,
            },
          });
        });
    });

    if (!operations.length) {
      console.info('No values found to seed.');
      return;
    }

    const result = await TrackerFieldOptionModel.bulkWrite(operations, { ordered: false });
    const upserted = result.upsertedCount ?? 0;
    console.info(`Seeded tracker field options: ${upserted} new, ${operations.length - upserted} already present.`);

    // Per-field summary so it's clear what landed in each list.
    TRACKER_FIELDS.forEach((field) => {
      console.info(`  ${field}: ${valuesByField[field].size} distinct value(s)`);
    });
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.info('Disconnected from database.');
  }
}

seed();
