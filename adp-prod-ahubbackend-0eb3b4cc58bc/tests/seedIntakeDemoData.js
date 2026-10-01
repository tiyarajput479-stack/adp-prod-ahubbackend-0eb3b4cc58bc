/* eslint-disable no-console */
const { MongoClient } = require("mongodb");

const MAX_REQUESTS = 20;
const DEFAULT_COUNT = 20;

const REQUEST_TITLES = [
  "Payroll variance auto-reconciliation",
  "Invoice OCR triage workflow",
  "GL posting exception bot",
  "Tax filing readiness assistant",
  "Onboarding workflow automation",
  "Benefits enrollment decision engine",
  "Retro payroll correction workflow",
  "Compliance evidence pack generator",
  "Case assignment rules optimization",
  "Year-end balancing cockpit",
  "Off-cycle payroll approval chain",
  "Document retention auto-tagging",
  "Leave accrual anomaly detector",
  "Payment rejection root-cause flow",
  "SLA breach prediction model",
  "Case notes summarization agent",
  "Payroll calendar conflict resolver",
  "Workday feed validation guardrails",
  "Separation payout verifier",
  "Variance reason-code recommendation",
];

const REQUESTORS = [
  { id: "maria.rossi@adp.com", name: "Maria Rossi" },
  { id: "antoine.bernard@adp.com", name: "Antoine Bernard" },
  { id: "emma.johnson@adp.com", name: "Emma Johnson" },
  { id: "julian.weber@adp.com", name: "Julian Weber" },
  { id: "chloe.smith@adp.com", name: "Chloe Smith" },
  { id: "nina.keller@adp.com", name: "Nina Keller" },
  { id: "liam.brown@adp.com", name: "Liam Brown" },
  { id: "sara.khan@adp.com", name: "Sara Khan" },
  { id: "noah.miller@adp.com", name: "Noah Miller" },
  { id: "sofia.lopez@adp.com", name: "Sofia Lopez" },
];

const COUNTRIES = [
  "France",
  "Global Payroll",
  "Italy",
  "NBS",
  "Netherlands",
  "NL",
  "Spain",
  "UK",
];

const OFFERS = ["ADP Celergo", "ADP GlobalView", "ADP iHCM", "ADP SmartCompliance"];
const STATUSES = ["Submitted", "In Review", "In Delivery", "Delivered"];
const PIPELINE_STAGES = [
  "Submitted",
  "Under GPT Evaluation",
  "Committed by GPT",
  "Under DT Evaluation",
  "In Delivery",
  "Delivered",
];
const QUEUES = ["My requests", "Assigned to me"];
const SOLUTION_TYPES = ["Existing", "New", "Enhancement", "Migration"];

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampCount(value) {
  const n = toInt(value, DEFAULT_COUNT);
  if (n < 1) return 1;
  if (n > MAX_REQUESTS) return MAX_REQUESTS;
  return n;
}

function stageAndGptForStatus(status, index) {
  if (status === "Delivered") {
    return { stage: "Delivered", gptDelivery: "Delivered" };
  }
  if (status === "In Delivery") {
    return {
      stage: index % 2 === 0 ? "Committed by GPT" : "In Delivery",
      gptDelivery: "Committed",
    };
  }
  if (status === "In Review") {
    return {
      stage: index % 2 === 0 ? "Under GPT Evaluation" : "Under DT Evaluation",
      gptDelivery: "Under review",
    };
  }
  return { stage: "Submitted", gptDelivery: "Under review" };
}

function buildDemoRequests(count) {
  return Array.from({ length: count }, (_, index) => {
    const requestor = REQUESTORS[index % REQUESTORS.length];
    const status = STATUSES[index % STATUSES.length];
    const { stage, gptDelivery } = stageAndGptForStatus(status, index);

    const savingsDollar = 25000 + index * 7800;
    const savingsFte = Number((0.7 + index * 0.28).toFixed(1));
    const deliveryWeeks = status === "Submitted" || status === "In Review" ? 0 : 4 + (index % 9);

    const createdAt = new Date(Date.now() - (count - index) * 86400000 * 3);
    const updatedAt = new Date(createdAt.getTime() + (index % 5) * 86400000);

    const solutionType = SOLUTION_TYPES[index % SOLUTION_TYPES.length];
    const safeStage = PIPELINE_STAGES.includes(stage) ? stage : "Submitted";

    return {
      oppId: `OPP-${1201 + index}`,
      requestTitle: REQUEST_TITLES[index % REQUEST_TITLES.length],
      requestorId: requestor.id,
      requestorName: requestor.name,
      countryBu: COUNTRIES[index % COUNTRIES.length],
      offer: OFFERS[index % OFFERS.length],
      savingsDollar,
      savingsFte,
      status,
      gptDelivery,
      stage: safeStage,
      queue: QUEUES[index % QUEUES.length],
      solutionType,
      deliveryWeeks,
      createdAt,
      updatedAt,
    };
  });
}

async function run() {
  const mongoUri = process.env.DEMO_MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing DEMO_MONGO_URI (or MONGODB_URI) environment variable.");
  }

  const count = clampCount(process.env.DEMO_COUNT);
  const dbName = process.env.DEMO_DB_NAME || process.env.MONGO_DB_NAME;
  const collectionName = process.env.DEMO_COLLECTION || "intakerequests";
  const resetBeforeSeed = String(process.env.DEMO_RESET || "false").toLowerCase() === "true";

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = dbName ? client.db(dbName) : client.db();
    const collection = db.collection(collectionName);

    if (resetBeforeSeed) {
      await collection.deleteMany({ oppId: { $regex: "^OPP-12" } });
    }

    const documents = buildDemoRequests(count);
    const ops = documents.map((doc) => ({
      updateOne: {
        filter: { oppId: doc.oppId },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(ops, { ordered: false });

    console.log("✅ Demo data ingestion completed");
    console.log(`Database: ${db.databaseName}`);
    console.log(`Collection: ${collectionName}`);
    console.log(`Requested count: ${count} (max ${MAX_REQUESTS})`);
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log(`Upserted: ${result.upsertedCount}`);
  } finally {
    await client.close();
  }
}

run().catch((error) => {
  console.error("❌ Demo data ingestion failed:", error.message);
  process.exitCode = 1;
});



