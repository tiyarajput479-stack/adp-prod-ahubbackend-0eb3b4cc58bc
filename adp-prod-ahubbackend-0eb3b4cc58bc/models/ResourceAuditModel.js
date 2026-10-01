const mongoose = require('mongoose');

/**
 * Append-only audit log for Resource Tracker changes (add / edit / delete).
 *
 * Each document records a single change to a single resource, who made it, and
 * (for edits) the exact fields that changed. Entries are never updated or
 * deleted by the application, so the collection is a durable history of who
 * changed what and when.
 */
const ResourceAuditSchema = new mongoose.Schema(
  {
    // 'create' | 'update' | 'delete'
    action: { type: String, required: true, index: true },

    // The affected resource. `resourceId` is the Mongo _id (absent for brand
    // new rows created in bulk before an id is known); the name/product are
    // snapshots kept for readability even if the resource is later deleted.
    resourceId: { type: String, index: true },
    resourceName: { type: String, default: '' },
    projectProduct: { type: String, default: '' },

    // Who performed the change. `esId` comes from the auth token (trusted);
    // name/email are supplied by the client for display.
    actor: {
      esId: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },

    // For 'update': the list of changed fields [{ field, from, to }].
    // For 'create'/'delete': a single entry snapshot may be stored instead.
    changes: { type: Array, default: [] },

    // Full snapshot for create/delete so the record is self-contained.
    snapshot: { type: mongoose.Schema.Types.Mixed, default: null },

    // Ties this entry back to the HTTP request logs (Splunk correlationId).
    correlationId: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

ResourceAuditSchema.index({ createdAt: -1 });

const ResourceAuditModel = mongoose.model('ResourceAudit', ResourceAuditSchema);

module.exports = { ResourceAuditModel };
