const express = require("express");
const router = express.Router();
const { cancelBooking } = require("../controllers/bookingController");
const { validateObjectId } = require("../middleware/errorHandler");

router.patch("/:id/cancel", validateObjectId, cancelBooking);

module.exports = router;
