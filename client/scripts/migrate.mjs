import { execSync } from "child_process";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
};

function runMigrations() {
  console.log(`\n${colors.cyan}${colors.bright}=====================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright} 📦 [DATABASE MIGRATION] Checking migration status... ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}=====================================================${colors.reset}`);

  try {
    const output = execSync("npx prisma migrate deploy", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    const isAlreadyUpToDate =
      output.includes("No pending migrations to apply") ||
      output.includes("Database schema is up to date");

    if (isAlreadyUpToDate) {
      console.log(`${colors.yellow}ℹ️  STATUS: Already applied. No pending migrations found.${colors.reset}`);
      console.log(`${colors.green}✔  Database schema is up to date.${colors.reset}`);
    } else {
      console.log(`${colors.green}🚀 STATUS: New migrations detected and executed successfully!${colors.reset}`);
      // Print clean details if any
      const lines = output.trim().split("\n");
      const migrationLines = lines.filter(
        (line) =>
          line.includes("Applying migration") ||
          line.includes("applied") ||
          line.includes("migration(s) found")
      );
      if (migrationLines.length > 0) {
        console.log(`${colors.dim}${migrationLines.join("\n")}${colors.reset}`);
      }
      console.log(`${colors.green}✔  Migration execution SUCCESS.${colors.reset}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ ERROR: Migration execution FAILED!${colors.reset}`);
    if (error.stdout) {
      console.error(`${colors.dim}${error.stdout.toString().trim()}${colors.reset}`);
    }
    if (error.stderr) {
      console.error(`${colors.red}${error.stderr.toString().trim()}${colors.reset}`);
    } else if (error.message) {
      console.error(`${colors.red}${error.message}${colors.reset}`);
    }
    console.log(`${colors.red}=====================================================${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.cyan}${colors.bright}=====================================================${colors.reset}\n`);
}

runMigrations();
