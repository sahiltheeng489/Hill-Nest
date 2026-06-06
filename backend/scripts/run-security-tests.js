const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const username = process.env.SECURITY_USERNAME || "SOM";
const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const logDir = path.resolve(repoRoot, "run-logs");
const logFile = path.join(logDir, `security-test-${username}.log`);
const testFile = path.resolve(backendRoot, "tests", "securityHardening.test.js");
const startedAt = new Date().toISOString();

fs.mkdirSync(logDir, { recursive: true });

const result = spawnSync(process.execPath, ["--test", testFile], {
  cwd: backendRoot,
  encoding: "utf8",
  env: {
    ...process.env,
    SECURITY_USERNAME: username,
  },
});

const sections = [
  "Security Test Report",
  `User: ${username}`,
  `Started: ${startedAt}`,
  `Finished: ${new Date().toISOString()}`,
  `Exit Code: ${result.status ?? 1}`,
  "",
  "=== STDOUT ===",
  result.stdout || "",
  "",
  "=== STDERR ===",
  result.stderr || "",
  "",
];

fs.writeFileSync(logFile, sections.join("\n"), "utf8");

if (result.error) {
  process.stderr.write(`${result.error.stack || result.error.message}\n`);
}

process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");
process.stdout.write(`\nSecurity log saved to ${logFile}\n`);

process.exit(result.status ?? 1);
