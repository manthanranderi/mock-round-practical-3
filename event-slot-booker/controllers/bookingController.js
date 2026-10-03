const EventSlot = require("../models/EventSlot");
const Booking = require("../models/Booking");

exports.bookSlot = async (req, res, next) => {
  try {
    const { studentName, email, rollNo } = req.body;

    if (!studentName || !email) {
      return res.status(400).json({ success: false, message: "studentName and email are required" });
    }

    const slot = await EventSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    if (slot.status !== "Open") {
      return res.status(400).json({ success: false, message: "Slot is closed for booking" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const duplicate = await Booking.findOne({
      slotId: slot._id,
      email: normalizedEmail,
      bookingStatus: "Booked",
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "This email has already booked this slot" });
    }

    const activeCount = await Booking.countDocuments({ slotId: slot._id, bookingStatus: "Booked" });
    if (activeCount >= slot.capacity) {
      return res.status(400).json({ success: false, message: "Full Slot: no seats available" });
    }

    const booking = await Booking.create({
      slotId: slot._id,
      studentName,
      email: normalizedEmail,
      rollNo,
    });

    res.status(201).json({
      success: true,
      message: "Slot booked successfully",
      data: booking,
      availableSeats: slot.capacity - (activeCount + 1),
    });
  } catch (err) {
    next(err);
  }
};

exports.getSlotBookings = async (req, res, next) => {
  try {
    const slot = await EventSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });

    const bookings = await Booking.find({ slotId: slot._id, bookingStatus: "Booked" }).sort({ createdAt: 1 });
    res.json({
      success: true,
      slot: slot.eventName,
      capacity: slot.capacity,
      count: bookings.length,
      availableSeats: Math.max(slot.capacity - bookings.length, 0),
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    booking.bookingStatus = "Cancelled";
    await booking.save();

    const slot = await EventSlot.findById(booking.slotId);
    const active = await Booking.countDocuments({ slotId: booking.slotId, bookingStatus: "Booked" });

    res.json({
      success: true,
      message: "Booking cancelled, seat is free again",
      data: booking,
      availableSeats: slot ? Math.max(slot.capacity - active, 0) : null,
    });
  } catch (err) {
    next(err);
  }
};
