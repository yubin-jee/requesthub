import { execSync } from "child_process";

export default function globalSetup() {
  console.log("Reseeding database for clean test state...");
  execSync("npx prisma db seed", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://requesthub:requesthub@localhost:5432/requesthub",
    },
    stdio: "pipe",
  });
  console.log("Database reseeded.");
}
