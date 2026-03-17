// models/table.model.js
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    tableNumber: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED", "OCCUPIED"],
      default: "AVAILABLE"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);