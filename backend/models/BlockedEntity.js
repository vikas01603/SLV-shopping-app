const mongoose = require("mongoose");

const blockedEntitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["IP", "USER"],
      index: true,
    },
    value: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    isPermanent: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null, // null means permanent or manually unblocked
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockedEntity", blockedEntitySchema);
