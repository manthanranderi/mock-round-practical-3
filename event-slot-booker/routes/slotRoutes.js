const express = require("express");
const router = express.Router();
const { createSlot, getAllSlots, getSlotById, deleteSlot } = require("../controllers/slotController");
const { bookSlot, getSlotBookings } = require("../controllers/bookingController");
const { validateObjectId } = require("../middleware/errorHandler");

router.route("/").post(createSlot).get(getAllSlots);
router.route("/:id").get(validateObjectId, getSlotById).delete(validateObjectId, deleteSlot);
router.post("/:id/book", validateObjectId, bookSlot);
router.get("/:id/bookings", validateObjectId, getSlotBookings);

module.exports = router;

