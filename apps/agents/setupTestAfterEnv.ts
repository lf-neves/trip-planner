import { execSync } from "child_process";
import { prismaClient } from "database";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// TODO: refactor prisma to use local database in tests

beforeAll(async () => {
  execSync(
    "cd ../libs/database && pnpm run prisma:migrate reset --force --skip-seed && pnpm prisma:generate",
    {
      stdio: "inherit",
    }
  );

  await prismaClient.$connect();
});

beforeEach(async () => {
  await prismaClient.$executeRaw`TRUNCATE TABLE "Flight" CASCADE;`;
});

afterAll(async () => {
  await prismaClient.$disconnect();
});
