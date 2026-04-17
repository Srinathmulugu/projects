const express = require('express');

const router = express.Router();
const { loginAdmin, scrapeAndPreviewLeetcode, fetchByNumber } = require('../controllers/adminController');

router.post('/login', loginAdmin);
router.post('/scrape-leetcode', scrapeAndPreviewLeetcode);
router.post('/fetch-by-number', fetchByNumber);

module.exports = router;
