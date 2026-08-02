const express = require("express");
const router = express.Router();

const {
  listReports,
  deleteReport,
} = require("../controllers/reports.controller");

router.get("/", listReports);
router.delete("/:id", deleteReport);

module.exports = router;
