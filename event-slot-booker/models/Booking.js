const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "EventSlot", required: true, index: true },
    studentName: { type: String, required: [true, "studentName is required"], trim: true },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "email is invalid"],
    },
    rollNo: { type: String, trim: true },
    bookingStatus: { type: String, enum: ["Booked", "Cancelled"], default: "Booked" },
  },
  { timestamps: true }
);

bookingSchema.index(
  { slotId: 1, email: 1 },
  { unique: true, partialFilterExpression: { bookingStatus: "Booked" } }
);

module.exports = mongoose.model("Booking", bookingSchema);
