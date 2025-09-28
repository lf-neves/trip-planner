#!/usr/bin/env node

/**
 * Trip Planner Setup Script (Node.js version)
 * This script sets up the entire project after cloning the repository
 * Cross-platform alternative to setup.sh
 */

import { execSync } from "child_process";
import { existsSync, copyFileSync, appendFileSync, readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Utility functions for colored output
const print = {
  step: (message) =>
    console.log(`${colors.blue}[STEP]${colors.reset} ${message}`),
  success: (message) =>
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`),
  warning: (message) =>
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`),
  error: (message) =>
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`),
};

// Execute command with error handling
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf8",
      cwd: options.cwd || process.cwd(),
      ...options,
    });
    return result;
  } catch (error) {
    if (!options.silent) {
      print.error(`Command failed: ${command}`);
      print.error(error.message);
    }
    throw error;
  }
}

// Check if a command exists
function commandExists(command) {
  try {
    runCommand(
      `${process.platform === "win32" ? "where" : "which"} ${command}`,
      { silent: true }
    );
    return true;
  } catch {
    return false;
  }
}

// Check prerequisites
function checkPrerequisites() {
  print.step("Checking prerequisites...");

  // Check Node.js version
  const nodeVersion = process.version.slice(1).split(".")[0];
  if (parseInt(nodeVersion) < 18) {
    print.error(
      `Node.js version 18+ is required. Current version: ${process.version}`
    );
    process.exit(1);
  }

  // Check for pnpm
  if (!commandExists("pnpm")) {
    print.warning("pnpm is not installed. Installing pnpm globally...");
    runCommand("npm install -g pnpm");
  }

  print.success("Prerequisites check completed");
}

// Setup environment variables
function setupEnvironment() {
  print.step("Setting up environment variables...");

  const envPath = ".env";
  const envExamplePath = ".env.example";

  if (!existsSync(envPath)) {
    if (existsSync(envExamplePath)) {
      copyFileSync(envExamplePath, envPath);
      print.success("Created .env file from .env.example");
      print.warning(
        "Please update the .env file with your API keys before running the application"
      );
      print.warning(
        "Required API keys: OPENAI_API_KEY, ANTHROPIC_API_KEY (optional), TAVILY_API_KEY (optional)"
      );
    } else {
      print.error(".env.example file not found");
      process.exit(1);
    }
  } else {
    print.success(".env file already exists");
  }

  // Add database configuration if not present
  const envContent = readFileSync(envPath, "utf8");
  if (!envContent.includes("DATABASE_URL=")) {
    print.warning(
      "DATABASE_URL not found in .env file. Adding SQLite configuration..."
    );
    appendFileSync(
      envPath,
      '\n# Database Configuration\nDATABASE_URL="file:./dev.db"\nDIRECT_URL="file:./dev.db"\n'
    );
  }
}

// Install dependencies
function installDependencies() {
  print.step("Installing dependencies with pnpm...");
  runCommand("pnpm install");
  print.success("Dependencies installed successfully");
}

// Setup database
function setupDatabase() {
  print.step("Setting up database...");

  const dbPath = join("apps", "libs", "database");

  // Generate Prisma client
  print.step("Generating Prisma client...");
  runCommand("pnpm prisma:generate", { cwd: dbPath });

  // Run database migrations
  print.step("Running database migrations...");
  runCommand("pnpm prisma:migrate", { cwd: dbPath });

  print.success("Database setup completed");
}

// Build all packages
function buildPackages() {
  print.step("Building all packages...");
  runCommand("pnpm build");
  print.success("All packages built successfully");
}

// Seed database
function seedDatabase() {
  print.step("Checking for database seed data...");

  const dbPath = join("apps", "libs", "database");
  const seedPath = join(dbPath, "src", "seed", "itinerary.ts");

  if (existsSync(seedPath)) {
    print.step("Database seed file found...");
    print.warning(
      "Manual seed execution may be required due to TypeScript compilation"
    );
  } else {
    print.warning("No seed data found, skipping database seeding");
  }
}

// Verify setup
function verifySetup() {
  print.step("Verifying setup...");

  // Check if node_modules exists
  if (!existsSync("node_modules")) {
    print.error("Root node_modules not found");
    return false;
  }

  // Try to verify database connection
  try {
    const dbPath = join("apps", "libs", "database");
    runCommand("pnpm prisma db push --force-reset", {
      cwd: dbPath,
      silent: true,
    });
    print.success("Database connection verified");
  } catch {
    print.warning("Database connection could not be verified");
  }

  print.success("Setup verification completed");
  return true;
}

// Print next steps
function printNextSteps() {
  console.log("");
  console.log("🎉 Setup Complete!");
  console.log("==================");
  console.log("");
  console.log("Next steps:");
  console.log("1. Update your .env file with the required API keys:");
  console.log("   - OPENAI_API_KEY (required for GPT-4o)");
  console.log("   - DATABASE_URL");
  console.log("");
  console.log("2. Start the development server:");
  console.log("   pnpm dev");
  console.log("");
  console.log("3. Open your browser and navigate to:");
  console.log("   - Web app: http://localhost:3000");
  console.log("   - LangGraph Studio: http://localhost:2024");
  console.log("");
  console.log("4. Optional: Open Prisma Studio to view your database:");
  console.log("   cd apps/libs/database && pnpm prisma:studio");
  console.log("");
  print.success("Happy coding! 🚀");
}

// Main execution function
async function main() {
  try {
    console.log("🚀 Trip Planner Setup Script (Node.js)");
    console.log("=====================================");
    console.log("");

    checkPrerequisites();
    setupEnvironment();
    installDependencies();
    setupDatabase();
    // buildPackages();
    seedDatabase();
    verifySetup();

    printNextSteps();
  } catch (error) {
    print.error("Setup failed!");
    print.error(error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  print.error("Uncaught exception:");
  print.error(error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  print.error("Unhandled rejection:");
  print.error(reason);
  process.exit(1);
});

// Run the setup
main();
