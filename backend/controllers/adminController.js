const { scrapeLeetcodeProblem, fetchByProblemNumber } = require('../services/leetcodeService');

const ADMIN_NAME = process.env.ADMIN_NAME || 'admin';
const LEGACY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD || LEGACY_ADMIN_PASSWORD || 'admin123';
const ADMIN_PRIVATE_PASSWORD = process.env.ADMIN_PRIVATE_PASSWORD || LEGACY_ADMIN_PASSWORD || 'admin@9878';

const loginAdmin = (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const isValid =
    username.trim().toLowerCase() === ADMIN_NAME.toLowerCase() &&
    (password === ADMIN_LOGIN_PASSWORD || password === ADMIN_PRIVATE_PASSWORD);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  return res.json({ success: true });
};

const scrapeAndPreviewLeetcode = async (req, res) => {
  try {
    const { url } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: 'LeetCode URL is required' });
    }

    // Validate URL format
    if (!url.includes('leetcode.com/problems/')) {
      return res.status(400).json({ 
        error: 'Invalid URL format. Expected: https://leetcode.com/problems/problem-name/' 
      });
    }

    console.log(`Admin scrape request for URL: ${url}`);
    const problemData = await scrapeLeetcodeProblem(url);
    console.log(`Successfully scraped: ${problemData.title}`);
    return res.json(problemData);
  } catch (error) {
    console.error('LeetCode scrape error:', error.message);
    
    // Provide specific error messages
    let errorMsg = error.message;
    let suggestedAction = '';
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMsg = 'Cannot connect to LeetCode. Please check your internet connection.';
    } else if (error.response?.status === 429) {
      errorMsg = 'LeetCode is rate-limiting requests. Please try again in 1-2 minutes.';
      suggestedAction = 'Try again later or use manual entry.';
    } else if (error.response?.status === 403 || error.code === 'ETIMEDOUT') {
      errorMsg = 'LeetCode temporarily blocked the request. Using manual entry is recommended.';
      suggestedAction = 'Switch to "Add Manually" tab to enter problem details.';
    } else if (error.message.includes('Problem not found')) {
      errorMsg = 'Problem not found on LeetCode. Check the URL spelling.';
    }
    
    return res.status(400).json({ 
      error: errorMsg,
      suggestion: suggestedAction,
      code: error.code || 'SCRAPE_ERROR'
    });
  }
};

const fetchByNumber = async (req, res) => {
  try {
    const { number } = req.body || {};

    if (!number || isNaN(Number(number))) {
      return res.status(400).json({ error: 'A valid LeetCode problem number is required' });
    }

    console.log(`Admin fetch-by-number request: #${number}`);
    const problemData = await fetchByProblemNumber(Number(number));
    console.log(`Successfully fetched: ${problemData.title}`);
    return res.json(problemData);
  } catch (error) {
    console.error('Fetch by number error:', error.message);

    let errorMsg = error.message;
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMsg = 'Cannot connect to LeetCode. Check your internet connection.';
    } else if (error.response?.status === 429) {
      errorMsg = 'LeetCode is rate-limiting requests. Please try again in a minute.';
    } else if (error.response?.status === 403 || error.code === 'ETIMEDOUT') {
      errorMsg = 'LeetCode temporarily blocked the request. Try again shortly.';
    }

    return res.status(400).json({ error: errorMsg, code: error.code || 'FETCH_ERROR' });
  }
};

module.exports = { loginAdmin, scrapeAndPreviewLeetcode, fetchByNumber };
