#!/usr/bin/env node

/**
 * Post-setup validation script
 * Verifies that the setup was completed successfully
 */

import { existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const print = {
  info: (message) =>
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`),
  success: (message) =>
    console.log(`${colors.green}[✓]${colors.reset} ${message}`),
  warning: (message) =>
    console.log(`${colors.yellow}[!]${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}[✗]${colors.reset} ${message}`),
};

let hasErrors = false;

function checkFile(path, name) {
  if (existsSync(path)) {
    print.success(`${name} exists`);
    return true;
  } else {
    print.error(`${name} missing: ${path}`);
    hasErrors = true;
    return false;
  }
}

function runCheck(command, name, options = {}) {
  try {
    execSync(command, { stdio: "pipe", ...options });
    print.success(`${name} works`);
    return true;
  } catch (error) {
    print.error(`${name} failed: ${error.message.split("\n")[0]}`);
    hasErrors = true;
    return false;
  }
}

console.log("🔍 Trip Planner Setup Validation");
console.log("=================================");
console.log("");

// Check essential files
print.info("Checking essential files...");
checkFile(".env", "Environment file");
checkFile("node_modules", "Root dependencies");
checkFile(join("apps", "web", "node_modules"), "Web dependencies");
checkFile(join("apps", "agents", "node_modules"), "Agents dependencies");
checkFile(
  join("apps", "libs", "database", "node_modules"),
  "Database dependencies"
);

console.log("");

// Check generated files
print.info("Checking generated files...");
checkFile(
  join("apps", "libs", "database", "src", "generated"),
  "Prisma generated files"
);

console.log("");

// Check build artifacts
print.info("Checking build artifacts...");
checkFile(join("apps", "web", ".next"), "Next.js build files");
checkFile(join("apps", "agents", "dist"), "Agents build files");

console.log("");

// Check commands
print.info("Checking commands...");
runCheck("pnpm --version", "pnpm");
runCheck("pnpm turbo --version", "Turbo");

console.log("");

// Check database
print.info("Checking database...");
runCheck("pnpm prisma db push --force-reset", "Database connection", {
  cwd: join("apps", "libs", "database"),
});

console.log("");

// Summary
if (hasErrors) {
  print.error(
    "Setup validation failed! Please run the setup script again or check the issues above."
  );
  process.exit(1);
} else {
  print.success("All checks passed! Your setup is ready.");
  console.log("");
  console.log("Next steps:");
  console.log("1. Update your .env file with API keys");
  console.log("2. Run: pnpm dev");
  console.log("3. Open http://localhost:3000");
}
