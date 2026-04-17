const axios = require('axios');

// Create an axios instance with better defaults
const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Origin': 'https://leetcode.com',
    'Referer': 'https://leetcode.com/',
  },
});

const scrapeLeetcodeProblem = async (url) => {
  try {
    // Extract problem slug from URL
    const match = url.match(/leetcode\.com\/problems\/([a-z0-9\-]+)/i);
    if (!match) {
      throw new Error('Invalid LeetCode URL format. Use: https://leetcode.com/problems/problem-name/');
    }

    const slug = match[1];
    const graphqlUrl = 'https://leetcode.com/graphql';

    const query = `
      query getProblem($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          content
          exampleTestcases
          hints
          codeSnippets {
            lang
            langSlug
            code
          }
        }
      }
    `;

    console.log(`Scraping LeetCode problem: ${slug}`);
    
    let response;
    let lastError;
    
    // Retry with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await axiosInstance.post(graphqlUrl, {
          query,
          variables: { titleSlug: slug },
        });
        break; // Success, exit loop
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to connect to LeetCode after 3 attempts');
    }

    if (!response) {
      throw lastError || new Error('Failed to connect to LeetCode after 3 attempts');
    }

    // Check for GraphQL errors in response
    if (response.data?.errors) {
      console.error('GraphQL errors:', response.data.errors);
      throw new Error(`GraphQL error: ${response.data.errors[0]?.message || 'Unknown error'}`);
    }

    const problemData = response.data?.data?.question;
    if (!problemData) {
      throw new Error('Problem not found. Check the URL and try again.');
    }

    // Parse difficulty
    const difficulty = problemData.difficulty || 'Medium';

    // Parse topics - use first topic or default
    const topic = problemData.topicTags?.[0]?.name || 'General';

    // Parse examples from HTML description
    const examples = parseExamples(problemData.exampleTestcases || '');

    // Extract starter code for JavaScript
    const jsStarter = problemData.codeSnippets?.find(
      (s) => s.langSlug === 'javascript'
    )?.code || '/**\n * @param {any} param\n * @return {type}\n */\nvar solution = function(param) {\n  \n};\n';

    const pythonStarter = problemData.codeSnippets?.find(
      (s) => s.langSlug === 'python'
    )?.code || 'class Solution(object):\n    def solve(self, param):\n        """\n        :type param: type\n        :rtype: type\n        """\n        pass\n';

    const javaStarter = problemData.codeSnippets?.find(
      (s) => s.langSlug === 'java'
    )?.code || 'class Solution {\n    public void solve(int param) {\n        \n    }\n}\n';

    const cppStarter = problemData.codeSnippets?.find(
      (s) => s.langSlug === 'cpp'
    )?.code || 'class Solution {\npublic:\n    void solve(int param) {\n        \n    }\n};\n';

    return {
      title: problemData.title,
      difficulty,
      topic,
      description: cleanHtml(problemData.content),
      examples: examples.examples,
      constraints: examples.constraints,
      hints: (problemData.hints || []).map((h) => cleanHtml(h)),
      solution: '',
      starterCode: {
        javascript: jsStarter,
        python: pythonStarter,
        java: javaStarter,
        cpp: cppStarter,
      },
      leetcodeUrl: url,
      leetcodeId: problemData.questionFrontendId,
    };
  } catch (error) {
    throw new Error(`Failed to scrape LeetCode problem: ${error.message}`);
  }
};

const cleanHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<code>/g, '`')
    .replace(/<\/code>/g, '`')
    .replace(/<strong>/g, '')
    .replace(/<\/strong>/g, '')
    .replace(/<em>/g, '')
    .replace(/<\/em>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
};

const parseExamples = (testcases) => {
  const examples = [];
  const constraints = [];

  // Parse examples from testcases string
  if (testcases) {
    const lines = testcases.split('\n').filter((l) => l.trim());
    for (let i = 0; i < lines.length - 1; i += 2) {
      examples.push({
        input: lines[i],
        output: lines[i + 1] || '',
        explanation: '',
      });
    }
  }

  return { examples: examples.length > 0 ? examples : [], constraints };
};

// Resolve problem number → titleSlug using LeetCode's problemset list query
const resolveSlugFromNumber = async (number) => {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        data {
          questionFrontendId
          titleSlug
          title
        }
      }
    }
  `;

  const response = await axiosInstance.post('https://leetcode.com/graphql', {
    query,
    variables: {
      categorySlug: '',
      limit: 10,
      skip: 0,
      filters: { searchKeywords: String(number) },
    },
  });

  const questions = response.data?.data?.questionList?.data || [];
  const match = questions.find((q) => String(q.questionFrontendId) === String(number));
  if (!match) {
    throw new Error(`Problem #${number} not found on LeetCode. Check the number and try again.`);
  }
  return match.titleSlug;
};

// Fetch full problem details by LeetCode problem number (e.g. 268)
const fetchByProblemNumber = async (number) => {
  const slug = await resolveSlugFromNumber(number);
  const url = `https://leetcode.com/problems/${slug}/`;
  return await scrapeLeetcodeProblem(url);
};

module.exports = { scrapeLeetcodeProblem, fetchByProblemNumber };
