const OpenAI = require('openai');

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  return new OpenAI({ apiKey });
};

const callOpenAI = async (messages, max_tokens = 300) => {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
};

// Generate AI hint for a problem using OpenAI
const generateHint = async (problem) => {
  return callOpenAI(
    [
      {
        role: 'system',
        content: 'You are a helpful coding tutor. Give a brief, helpful hint for solving the coding problem without giving away the full solution. Keep it to 2-3 sentences.',
      },
      {
        role: 'user',
        content: `Problem: ${problem.title}\nDescription: ${problem.description}\nDifficulty: ${problem.difficulty}\nTopic: ${problem.topic}`,
      },
    ],
    150
  );
};

const generateStepByStepHints = async (problem) => {
  return callOpenAI(
    [
      {
        role: 'system',
        content: 'You are a coding tutor. Give exactly 4 progressive hints. Start vague, then become more specific. Do not reveal full code. Format as a numbered list.',
      },
      {
        role: 'user',
        content: `Problem: ${problem.title}\nDescription: ${problem.description}\nDifficulty: ${problem.difficulty}\nTopic: ${problem.topic}\nStored hints: ${(problem.hints || []).join(' | ')}`,
      },
    ],
    300
  );
};

const explainSolution = async (problem, userCode) => {
  return callOpenAI(
    [
      {
        role: 'system',
        content: 'You are a senior DSA mentor. Explain the solution in clear terms: core idea, data structure/algorithm choice, time complexity, space complexity, and why it works. Keep it practical and concise.',
      },
      {
        role: 'user',
        content: `Problem: ${problem.title}\nDescription: ${problem.description}\nDifficulty: ${problem.difficulty}\nTopic: ${problem.topic}\nUser solution or approach:\n${userCode || 'No code provided. Explain the likely optimal approach.'}`,
      },
    ],
    500
  );
};

const optimizeCode = async (problem, userCode) => {
  if (!userCode || !userCode.trim()) {
    throw new Error('Code is required to optimize');
  }

  return callOpenAI(
    [
      {
        role: 'system',
        content: 'You are a senior coding interviewer. Review the submitted code and suggest concrete optimizations: algorithmic improvements, time/space complexity changes, simplifications, and edge-case fixes. Do not rewrite the full program unless necessary. Use short sections and bullets.',
      },
      {
        role: 'user',
        content: `Problem: ${problem.title}\nDescription: ${problem.description}\nDifficulty: ${problem.difficulty}\nTopic: ${problem.topic}\nCode to optimize:\n${userCode}`,
      },
    ],
    500
  );
};

module.exports = {
  generateHint,
  generateStepByStepHints,
  explainSolution,
  optimizeCode,
};
