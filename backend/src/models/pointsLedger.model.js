import mongoose from "mongoose";

const pointsLedgerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    points: { type: Number, required: true },
    type: { type: String, enum: ["earn", "redeem"], required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

pointsLedgerSchema.index({ user: 1, createdAt: -1 });

const PointsLedger = mongoose.model("PointsLedger", pointsLedgerSchema, "points_ledger");
export default PointsLedger;


