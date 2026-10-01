const mongoose = require('mongoose');
const CounterModel = require('./CounterModel');

// Human-readable, sequential business identifier settings. The value is
// generated server-side (never trusted from the client) so it is unique,
// unguessable in a "how many records exist" sense, and easy to reference.
const OPP_ID_SEQUENCE = 'intakeOppId';
const OPP_ID_PREFIX = 'OPP';
const OPP_ID_PAD = 6; // OPP-000123

// Coerces an offer value into a clean array of "; "/","-delimited labels.
// Offer impact is multi-select, so it is stored as a string array. This setter
// runs on every write (create and update) and accepts a plain string, an array
// of strings/objects, or a single option object, guarding against the stray
// "[object Object]" tokens produced by earlier client serialization bugs.
const normalizeOfferArraySetter = (value) => {
  const pickLabel = (item) => {
    if (item == null) return '';
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'object') {
      return String(item.value || item.label || item.title || item.name || '').trim();
    }
    return String(item).trim();
  };

  let parts = [];
  if (Array.isArray(value)) {
    parts = value.map(pickLabel);
  } else if (value && typeof value === 'object') {
    parts = [pickLabel(value)];
  } else if (typeof value === 'string') {
    parts = value.split(/[;,]/).map((item) => item.trim());
  }

  const cleaned = parts.filter((item) => item && item.toLowerCase() !== '[object object]');
  return Array.from(new Set(cleaned));
};

const PIPELINE_STAGES = [
  'Submitted',
  'Under Evaluation',
  'Ready for Review',
  'Submitted to Support',
  // Current review-outcome wording (must match the frontend / controller).
  'TECH APPROVED - SHARED SUPPORT',
  'TECH APPROVED - GPT FULL SOLUTION',
  'TECH APPROVED - DIGITECH FULL SOLUTION',
  'REJECTED',
  // Legacy review-outcome wording retained so existing records still validate.
  'Committed - Shared Support',
  'Committed - GPT Full Solution',
  'Committed - DT Full Solution',
  'Rejected - Existing DT Solution',
  'Rejected - Value Proposition',
  'Rejected by GPT Team',
  'Rejected by DT Team',
  'Under GPT Evaluation',
  'Under DT Evaluation',
  'Committed by GPT',
  'Committed by DT',
];

const AttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    size: { type: Number, default: 0 },
    type: { type: String, default: '', trim: true },
  },
  { _id: false }
);

// Immutable audit trail of every status transition. Each entry records who
// performed the action and when, so the UI timeline can show the actual actor
// per status change (instead of always showing the original requestor).
const StatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, default: '', trim: true },
    action: { type: String, default: '', trim: true },
    actorName: { type: String, default: '', trim: true },
    actorEmail: { type: String, default: '', trim: true },
    changedOn: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true },
  },
  { _id: false }
);

// One "BU Input following GPTech Board" line: a BU, a SOURCE (DT / GPT / BPI)
// and one numeric value per fiscal month (JUL -> JUN). `months` is stored as a
// free-form object so partial/legacy month sets still round-trip cleanly.
// `subBu` / `region` capture the Global Payroll BU logic ("column M"): when the
// line's BU is "Global Payroll" the reviewer picks a single Sub BU, and a "GV"
// Sub BU additionally captures a single Region. Multiple Sub BUs / Regions are
// split across multiple lines.
const BuInputRowSchema = new mongoose.Schema(
  {
    bu: { type: String, default: '', trim: true },
    source: { type: String, default: '', trim: true },
    subBu: { type: String, default: '', trim: true },
    region: { type: String, default: '', trim: true },
    months: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

// Audit trail for the SLT Portfolio (Ops Plan) status track. Mirrors the main
// StatusHistorySchema but records transitions of `opsStatus` so the SLT flow
// keeps its own who/when history independent of the technical-assessment flow.
const OpsStatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, default: '', trim: true },
    action: { type: String, default: '', trim: true },
    actorName: { type: String, default: '', trim: true },
    actorEmail: { type: String, default: '', trim: true },
    changedOn: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const IntakeRequestSchema = new mongoose.Schema(
  {
    oppId: { type: String, required: true, unique: true, index: true },
    requestTitle: { type: String, required: true, trim: true },
    requestorId: { type: String, default: '', trim: true },
    requestorName: { type: String, default: '', trim: true },
    submittedBy: { type: String, default: '', trim: true },
    owner: { type: String, default: '', trim: true },
    countryBu: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    // Global Payroll BU logic captures: the submitter's Sub BU and Region
    // selections (multi-select). Only populated for BUs configured with Sub BUs
    // in Administration -> Countries/BUs.
    subBu: { type: [String], default: [] },
    region: { type: [String], default: [] },
    offerImpact: { type: [String], default: [], set: normalizeOfferArraySetter },
    dtOfferImpact: { type: String, default: '', trim: true },
    savingsDollar: { type: Number, default: 0 },
    savingsFte: { type: Number, default: 0 },
    fteAnnualSavings: { type: Number, default: 0 },
    expectedDelivery: { type: String, default: '', trim: true },
    team: { type: String, default: '', trim: true },
    status: { type: String, default: 'Submitted', trim: true },
    // SLT Portfolio (Ops Plan) flow. A dedicated status track that extends the
    // technical-assessment flow with the SLT stages (Requires BU Input ->
    // Ready for SLT -> Approved -> In SHP). `buInputRows` captures the BU input
    // table filled after the GPTech Board; `opsStatusHistory` is the who/when
    // audit trail for this track. Managed server-side via the ops-action
    // endpoint and the SLT board's BU-input save.
    opsStatus: { type: String, default: '', trim: true },
    opsUpdatedBy: { type: String, default: '', trim: true },
    buInputRows: { type: [BuInputRowSchema], default: [] },
    opsStatusHistory: { type: [OpsStatusHistorySchema], default: [] },
    gptDelivery: { type: String, default: '', trim: true },
    stage: { type: String, enum: PIPELINE_STAGES, default: 'Submitted' },
    solutionType: { type: String, default: 'Existing', trim: true },
    solution: { type: String, default: 'Existing', trim: true },
    deliveryWeeks: { type: Number, default: 0 },
    problemStatement: { type: String, default: '', trim: true },
    targetDate: { type: String, default: '', trim: true },
    opportunityOverview: { type: String, default: '', trim: true },
    opportunity: { type: String, default: '', trim: true },
    incidentSavingsDollar: { type: Number, default: 0 },
    timeSavingsPerMonth: { type: Number, default: 0 },
    shore: { type: String, default: '', trim: true },
    incidentsSaved: { type: Number, default: 0 },
    timeSavings: { type: Number, default: 0 },
    clientsImpacted: { type: Number, default: 0 },
    fteSavingsDollar: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    statusChangedOn: { type: String, default: '', trim: true },
    completedOn: { type: String, default: '', trim: true },
    submittedOn: { type: String, default: '', trim: true },
    created: { type: String, default: '', trim: true },
    modified: { type: String, default: '', trim: true },
    requestType: { type: String, default: '', trim: true },
    serviceImplementation: { type: [String], default: [] },
    strategicInitiatives: { type: [String], default: [] },
    orgReadiness: { type: String, default: '', trim: true },
    benefitTypes: { type: [String], default: [] },
    productivityLevel: { type: String, default: '', trim: true },
    costAvoidanceLevel: { type: String, default: '', trim: true },
    complianceRiskLevel: { type: String, default: '', trim: true },
    technicalDetailsMode: { type: String, enum: ['text', 'attachment'], default: 'text' },
    technicalDependencies: { type: String, default: '', trim: true },
    bcProcessOwner: { type: String, default: '', trim: true },
    bcProjectSponsor: { type: String, default: '', trim: true },
    bcProblemStatement: { type: String, default: '', trim: true },
    bcGoalStatement: { type: String, default: '', trim: true },
    bcScopeIn: { type: String, default: '', trim: true },
    bcScopeOut: { type: String, default: '', trim: true },
    businessCase: {
      processOwner: { type: String, default: '', trim: true },
      projectSponsor: { type: String, default: '', trim: true },
      problemStatement: { type: String, default: '', trim: true },
      goalStatement: { type: String, default: '', trim: true },
      scopeIn: { type: String, default: '', trim: true },
      scopeOut: { type: String, default: '', trim: true },
    },
    timelineDate: { type: String, default: '', trim: true },
    timelineNotes: { type: String, default: '', trim: true },
    processName: { type: String, default: '', trim: true },
    tool: { type: String, default: '', trim: true },
    systemRequestTypes: { type: [String], default: [] },
    systemSource: { type: String, default: '', trim: true },
    legalDetails: { type: String, default: '', trim: true },
    complianceDetails: { type: String, default: '', trim: true },
    deliveryModel: { type: String, default: '', trim: true },
    securityMode: { type: String, enum: ['number', 'risk'], default: 'number' },
    securityRiskLevel: { type: String, default: '', trim: true },
    securityIncidents: { type: Number, default: 0 },
    timeMode: { type: String, enum: ['details', 'cost'], default: 'details' },
    costReductionLevel: { type: String, default: '', trim: true },
    minutesSavedPerTransaction: { type: Number, default: 0 },
    annualVolume: { type: Number, default: 0 },
    revenueMode: { type: String, enum: ['amount', 'level'], default: 'amount' },
    revenueImpact: { type: Number, default: 0 },
    revenueGenerationLevel: { type: String, default: '', trim: true },
    efficiencyLevel: { type: String, default: '', trim: true },
    businessValueComment: { type: String, default: '', trim: true },
    businessValueValidated: { type: Boolean, default: false },
    calculatedBusinessValue: { type: Number, default: 0 },
    dtStrategic: { type: Number, default: 0 },
    dtFeasibility: { type: Number, default: 0 },
    dtInvestment: { type: Number, default: 0 },
    dtSizing: { type: String, default: '', trim: true },
    dtRoi: { type: Number, default: 0 },
    dtBenefitScore: { type: Number, default: 0 },
    dtTechnicalReadiness: { type: String, default: '', trim: true },
    dtImplementationEffort: { type: String, default: '', trim: true },
    dtTimeToValueGpt: { type: String, default: '', trim: true },
    dtDevTimeDt: { type: String, default: '', trim: true },
    dtOrgReadiness: { type: String, default: '', trim: true },
    dtPrioritizationScore: { type: Number, default: 0 },
    dtCommitmentRecommendation: { type: String, default: '', trim: true },
    dtRejectionReason: { type: String, default: '', trim: true },
    dtDeliveryEstimate: { type: String, default: '', trim: true },
    dtDelivery: { type: String, default: '', trim: true },
    dtRequiredAttendees: { type: String, default: '', trim: true },
    dtNotes: { type: String, default: '', trim: true },
    dtEvaluator: { type: String, default: '', trim: true },
    dtEvaluatedOn: { type: String, default: '', trim: true },
    dtFeasibilityCriteria: { type: String, default: '', trim: true },
    dtDraftSavedOn: { type: String, default: '', trim: true },
    gptStrategic: { type: Number, default: 0 },
    gptFeasibility: { type: Number, default: 0 },
    gptInvestment: { type: Number, default: 0 },
    gptRoi: { type: Number, default: 0 },
    gptSizing: { type: String, default: '', trim: true },
    gptBenefitScore: { type: Number, default: 0 },
    gptTechnicalReadiness: { type: String, default: '', trim: true },
    gptImplementationEffort: { type: String, default: '', trim: true },
    gptTimeToValueGpt: { type: String, default: '', trim: true },
    gptDevTimeDt: { type: String, default: '', trim: true },
    gptOrgReadiness: { type: String, default: '', trim: true },
    gptPrioritizationScore: { type: Number, default: 0 },
    gptCommitmentRecommendation: { type: String, default: '', trim: true },
    gptRejectionReason: { type: String, default: '', trim: true },
    gptDeliveryEstimate: { type: String, default: '', trim: true },
    gptNotes: { type: String, default: '', trim: true },
    gptEvaluator: { type: String, default: '', trim: true },
    gptEvaluatedOn: { type: String, default: '', trim: true },
    gptFeasibilityCriteria: { type: String, default: '', trim: true },
    gptDraftSavedOn: { type: String, default: '', trim: true },
    gptRequiredAttendees: { type: String, default: '', trim: true },
    // Final review decision (captured in the review modal).
    reviewOutcome: { type: String, default: '', trim: true },
    reviewerNotes: { type: String, default: '', trim: true },
    evaluatorNotes: { type: String, default: '', trim: true },
    finalReviewer: { type: String, default: '', trim: true },
    reviewDraftSavedOn: { type: String, default: '', trim: true },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true }
);

// Generate the user-facing `oppId` from an atomic counter when one has not
// already been assigned. Runs on `validate` (before `save`) so the
// `required: true` constraint on `oppId` is satisfied for new documents while
// never overwriting an existing value (e.g. imported/legacy records).
IntakeRequestSchema.pre('validate', async function assignOppId(next) {
  try {
    if (this.oppId && String(this.oppId).trim()) {
      return next();
    }

    const seq = await CounterModel.next(OPP_ID_SEQUENCE);
    this.oppId = `${OPP_ID_PREFIX}-${String(seq).padStart(OPP_ID_PAD, '0')}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

const IntakeRequestModel = mongoose.model('IntakeRequests', IntakeRequestSchema);

module.exports = IntakeRequestModel;
