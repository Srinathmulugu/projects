const { db, admin } = require('../utils/firebase');
const { executeCode } = require('../services/judge0Service');

const normalizeOutput = (text) => String(text ?? '').replace(/\r\n/g, '\n').trim();

// Submit solution
const submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.uid;

    if (!problemId || !code || !language) {
      return res.status(400).json({ error: 'problemId, code, and language are required' });
    }

    const problemDoc = await db.collection('problems').doc(problemId).get();
    if (!problemDoc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = problemDoc.data();
    const testCases = Array.isArray(problem.testCases) ? problem.testCases.slice(0, 4) : [];
    if (testCases.length !== 4) {
      return res.status(400).json({ error: 'Problem does not have exactly 4 test cases configured' });
    }

    let result = { status: 'Accepted', output: 'All 4 test cases passed.' };
    const testCaseResults = [];

    for (let i = 0; i < testCases.length; i += 1) {
      const testCase = testCases[i];
      const wrapper = problem.executionWrapper && problem.executionWrapper[language];
      const execCode = wrapper ? wrapper.replace('__USER_CODE__', code) : code;
      const execution = await executeCode(execCode, language, testCase.input || '');

      const actualOutput = normalizeOutput(execution.output);
      const expectedOutput = normalizeOutput(testCase.expectedOutput);
      const passed = execution.status === 'Accepted' && actualOutput === expectedOutput;

      testCaseResults.push({
        index: i + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: execution.output,
        status: passed ? 'Passed' : execution.status,
      });

      if (!passed) {
        result = {
          status: execution.status === 'Accepted' ? 'Wrong Answer' : execution.status,
          output: `Failed on test case ${i + 1}. Expected: ${testCase.expectedOutput} | Got: ${execution.output || '(empty)'}`,
        };
        break;
      }
    }

    // Save submission
    const submission = {
      userId,
      problemId,
      code,
      language,
      result: result.status,
      output: result.output || '',
      testCaseResults,
      createdAt: new Date().toISOString(),
    };

    await db.collection('submissions').add(submission);

    // Update user's solved problems only when all test cases pass
    if (result.status === 'Accepted') {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const today = new Date().toISOString().split('T')[0];
        const lastDate = userData.lastSolvedDate;
        let newStreak = userData.streak || 0;

        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          newStreak = lastDate === yesterday ? newStreak + 1 : 1;
        }

        await userRef.update({
          solvedProblems: admin.firestore.FieldValue.arrayUnion(problemId),
          streak: newStreak,
          lastSolvedDate: today,
        });
      }
    }

    res.json({ message: 'Solution submitted', submission });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
};

// Run code without submitting
const runCode = async (req, res) => {
  try {
    const { code, language, input, problemId } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    let execCode = code;

    if (problemId) {
      const problemDoc = await db.collection('problems').doc(problemId).get();
      if (problemDoc.exists) {
        const problem = problemDoc.data();
        const wrapper = problem.executionWrapper && problem.executionWrapper[language];
        if (wrapper) {
          execCode = wrapper.replace('__USER_CODE__', code);
        }
      }
    }

    const result = await executeCode(execCode, language, input);
    res.json(result);
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: 'Failed to run code', details: error.message });
  }
};

// Get user's submissions
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { problemId } = req.query;

    let query = db.collection('submissions').where('userId', '==', userId);
    if (problemId) {
      query = query.where('problemId', '==', problemId);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
    const submissions = [];
    snapshot.forEach((doc) => {
      submissions.push({ id: doc.id, ...doc.data() });
    });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

module.exports = { submitSolution, runCode, getUserSubmissions };
