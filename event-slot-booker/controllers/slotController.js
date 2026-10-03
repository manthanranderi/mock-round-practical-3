const EventSlot = require("../models/EventSlot");
const Booking = require("../models/Booking");

const withSeats = (slot, activeBookings) => ({
  ...slot.toObject(),
  activeBookings,
  availableSeats: Math.max(slot.capacity - activeBookings, 0),
});

exports.createSlot = async (req, res, next) => {
  try {
    const { eventName, date, startTime, endTime, location, capacity, status } = req.body;

    if (!eventName || !date || !startTime || !endTime || !location || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: "eventName, date, startTime, endTime, location and capacity are required",
      });
    }
    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ success: false, message: "date is invalid" });
    }
    if (typeof capacity !== "number" || !Number.isInteger(capacity) || capacity <= 0) {
      return res.status(400).json({ success: false, message: "capacity must be a whole number greater than 0" });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ success: false, message: "endTime must be after startTime" });
    }

    const slot = await EventSlot.create({ eventName, date, startTime, endTime, location, capacity, status });
    res.status(201).json({ success: true, message: "Slot created", data: withSeats(slot, 0) });
  } catch (err) {
    next(err);
  }
};

exports.getAllSlots = async (req, res, next) => {
  try {
    const slots = await EventSlot.find().sort({ date: 1, startTime: 1 });

    const counts = await Booking.aggregate([
      { $match: { bookingStatus: "Booked" } },
      { $group: { _id: "$slotId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const data = slots.map((s) => withSeats(s, countMap.get(String(s._id)) || 0));
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

exports.getSlotById = async (req, res, next) => {
  try {
    const slot = await EventSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    const active = await Booking.countDocuments({ slotId: slot._id, bookingStatus: "Booked" });
    res.json({ success: true, data: withSeats(slot, active) });
  } catch (err) {
    next(err);
  }
};

exports.deleteSlot = async (req, res, next) => {
  try {
    const slot = await EventSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    const active = await Booking.countDocuments({ slotId: slot._id, bookingStatus: "Booked" });
    if (active > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete slot: ${active} active booking(s) exist. Cancel them first.`,
      });
    }

    await Booking.deleteMany({ slotId: slot._id }); // remove old cancelled records
    await slot.deleteOne();
    res.json({ success: true, message: "Slot deleted" });
  } catch (err) {
    next(err);
  }
};
