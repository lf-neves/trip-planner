# Setup Scripts

This directory contains automated setup scripts to quickly get the Trip Planner application running after cloning the repository.

## Available Scripts

### 1. `setup.mjs` (Recommended - Cross-platform)

Node.js-based setup script that works on all platforms.

```bash
npm run setup
# or
node setup.mjs
```

### 2. `setup.sh` (Linux/macOS)

Bash script with detailed error handling and colored output.

```bash
chmod +x setup.sh
./setup.sh
# or
npm run setup:bash
```

### 3. `setup.bat` (Windows)

Windows batch file that calls the Node.js script.

```cmd
setup.bat
```

## What These Scripts Do

1. **Prerequisites Check**
   - Verify Node.js 18+ is installed
   - Install pnpm globally if not present

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add database configuration if missing

3. **Dependencies Installation**
   - Run `pnpm install` to install all project dependencies

4. **Database Setup**
   - Generate Prisma client
   - Run database migrations
   - Set up SQLite database

5. **Build Process**
   - Build all packages in the monorepo

6. **Verification**
   - Verify all components are working correctly

## After Setup

1. Update your `.env` file with API keys:
   - `OPENAI_API_KEY` (required)
   - `ANTHROPIC_API_KEY` (optional)
   - `TAVILY_API_KEY` (optional)

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Access the applications:
   - Web App: http://localhost:3000
   - LangGraph Studio: http://localhost:2024

## Troubleshooting

If the setup scripts fail:

1. Ensure you have Node.js 18+ installed
2. Try running the setup script with elevated permissions
3. Check your internet connection for dependency downloads
4. Review the error messages for specific issues
5. Fall back to manual setup as described in the main README

## Manual Cleanup

If you need to reset the setup:

```bash
# Remove dependencies
rm -rf node_modules apps/*/node_modules apps/libs/*/node_modules

# Remove generated files
rm -rf apps/libs/database/src/generated

# Remove database
rm -f apps/libs/database/dev.db*

# Remove environment file (be careful!)
rm .env
```
