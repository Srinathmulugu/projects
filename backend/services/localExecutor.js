const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const NO_OUTPUT_MESSAGE = 'Program executed successfully, but no output was produced. Use console.log/print to see output.';

const normalizeOutput = (value) => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return NO_OUTPUT_MESSAGE;
};

// Local code execution for development/testing
const executeLocally = async (code, language, stdin = '') => {
  const tempDir = os.tmpdir();
  const timeout = 5000; // 5 second timeout

  try {
    if (language.toLowerCase() === 'javascript') {
      return executeJavaScript(code, stdin, timeout);
    } else if (language.toLowerCase() === 'python') {
      return executePython(code, stdin, tempDir, timeout);
    } else if (language.toLowerCase() === 'java') {
      return executeJava(code, stdin, tempDir, timeout);
    } else if (language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++') {
      return executeCpp(code, stdin, tempDir, timeout);
    } else {
      return {
        status: 'Error',
        output: `Unsupported language in local execution: ${language}`,
        time: 0,
        memory: 0,
      };
    }
  } catch (error) {
    return {
      status: 'Runtime Error',
      output: error.message || 'Unknown error',
      time: 0,
      memory: 0,
    };
  }
};

const executeJavaScript = (code, stdin, timeout) => {
  try {
    const startTime = Date.now();

    // Wrap in try-catch
    const wrappedCode = `
      (async () => {
        try {
          ${code}
        } catch (e) {
          console.log('Error: ' + e.message);
        }
      })();
    `;

    // Execute with timeout
    const result = execSync(`node -e "${wrappedCode.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout,
      stdio: 'pipe',
      input: stdin,
    });
    const endTime = Date.now();

    return {
      status: 'Accepted',
      output: normalizeOutput(result),
      time: (endTime - startTime) / 1000,
      memory: 0,
    };
  } catch (error) {
    const message = error.stderr?.toString() || error.message || 'Execution error';
    return {
      status: error.killed ? 'Time Limit Exceeded' : 'Runtime Error',
      output: message,
      time: 0,
      memory: 0,
    };
  }
};

const executePython = (code, stdin, tempDir, timeout) => {
  const tempFile = path.join(tempDir, `code_${Date.now()}.py`);
  try {
    fs.writeFileSync(tempFile, code);

    const startTime = Date.now();
    const result = execSync(`python "${tempFile}"`, {
      encoding: 'utf-8',
      timeout,
      stdio: 'pipe',
      input: stdin,
    });
    const endTime = Date.now();

    fs.unlinkSync(tempFile);

    return {
      status: 'Accepted',
      output: normalizeOutput(result),
      time: (endTime - startTime) / 1000,
      memory: 0,
    };
  } catch (error) {
    // Try to clean up temp file
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (e) {}

    const message = error.stderr?.toString() || error.message || 'Execution error';
    return {
      status: error.killed ? 'Time Limit Exceeded' : 'Runtime Error',
      output: message,
      time: 0,
      memory: 0,
    };
  }
};

const executeJava = (code, stdin, tempDir, timeout) => {
  try {
    // Extract class name from code
    const classMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Solution';

    const tempFile = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(tempFile, code);

    // Compile
    execSync(`javac "${tempFile}"`, {
      timeout,
      stdio: 'pipe',
    });

    // Run
    const startTime = Date.now();
    const result = execSync(`java -cp "${tempDir}" ${className}`, {
      encoding: 'utf-8',
      timeout,
      stdio: 'pipe',
      input: stdin,
    });
    const endTime = Date.now();

    // Cleanup
    fs.unlinkSync(tempFile);
    fs.unlinkSync(path.join(tempDir, `${className}.class`));

    return {
      status: 'Accepted',
      output: normalizeOutput(result),
      time: (endTime - startTime) / 1000,
      memory: 0,
    };
  } catch (error) {
    const message = error.stderr?.toString() || error.message || 'Compilation/Execution error';
    return {
      status: error.killed ? 'Time Limit Exceeded' : 'Compilation Error',
      output: message,
      time: 0,
      memory: 0,
    };
  }
};

const executeCpp = (code, stdin, tempDir, timeout) => {
  try {
    const tempFile = path.join(tempDir, `code_${Date.now()}.cpp`);
    const exeFile = path.join(tempDir, `code_${Date.now()}.exe`);

    fs.writeFileSync(tempFile, code);

    // Compile
    execSync(`g++ -o "${exeFile}" "${tempFile}"`, {
      timeout,
      stdio: 'pipe',
    });

    // Run
    const startTime = Date.now();
    const result = execSync(`"${exeFile}"`, {
      encoding: 'utf-8',
      timeout,
      stdio: 'pipe',
      input: stdin,
    });
    const endTime = Date.now();

    // Cleanup
    fs.unlinkSync(tempFile);
    fs.unlinkSync(exeFile);

    return {
      status: 'Accepted',
      output: normalizeOutput(result),
      time: (endTime - startTime) / 1000,
      memory: 0,
    };
  } catch (error) {
    const message = error.stderr?.toString() || error.message || 'Compilation/Execution error';
    return {
      status: error.killed ? 'Time Limit Exceeded' : 'Compilation Error',
      output: message,
      time: 0,
      memory: 0,
    };
  }
};

module.exports = { executeLocally };
