import { PrismaClient, Priority, Category, Status, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: "admin@requesthub.dev",
      name: "Alex Chen",
      password: hash("admin123"),
      role: Role.ADMIN,
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      email: "reviewer@requesthub.dev",
      name: "Jordan Kim",
      password: hash("reviewer123"),
      role: Role.REVIEWER,
    },
  });

  const requester = await prisma.user.create({
    data: {
      email: "requester@requesthub.dev",
      name: "Sam Rivera",
      password: hash("requester123"),
      role: Role.REQUESTER,
    },
  });

  // Create feature requests in various states
  const requests = await Promise.all([
    prisma.request.create({
      data: {
        title: "Add dark mode support",
        description:
          "Users have requested a dark mode toggle in the settings page. Should respect system preference by default and allow manual override.",
        priority: Priority.HIGH,
        category: Category.FRONTEND,
        status: Status.SUBMITTED,
        requesterId: requester.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Implement SSO with Okta",
        description:
          "Replace the current email/password auth with Okta SSO. Need to support SAML 2.0 and OIDC. Must handle group-based role mapping.",
        priority: Priority.CRITICAL,
        category: Category.BACKEND,
        status: Status.UNDER_REVIEW,
        requesterId: requester.id,
        assigneeId: reviewer.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Add export to CSV for request reports",
        description:
          "Finance team needs to export filtered request data to CSV for quarterly reviews. Should include all fields plus status history.",
        priority: Priority.MEDIUM,
        category: Category.FRONTEND,
        status: Status.APPROVED,
        requesterId: requester.id,
        assigneeId: reviewer.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Upgrade PostgreSQL to v16",
        description:
          "We're running PG 14 in production. Need to upgrade to 16 for performance improvements and new JSON functions. Requires migration plan.",
        priority: Priority.HIGH,
        category: Category.INFRASTRUCTURE,
        status: Status.IN_PROGRESS,
        requesterId: admin.id,
        assigneeId: admin.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Fix timezone handling in date filters",
        description:
          "Users in PST see requests created 'tomorrow' because the dashboard uses UTC. Need to convert to user's local timezone.",
        priority: Priority.MEDIUM,
        category: Category.FRONTEND,
        status: Status.DONE,
        requesterId: requester.id,
        assigneeId: reviewer.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Add rate limiting to API endpoints",
        description:
          "No rate limiting currently in place. Need to add per-user rate limits (100 req/min for standard users, 500 for admins).",
        priority: Priority.HIGH,
        category: Category.BACKEND,
        status: Status.SUBMITTED,
        requesterId: reviewer.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Set up CI/CD pipeline for staging",
        description:
          "We need automated deployments to staging on PR merge to develop branch. Use GitHub Actions with Docker build and push to ECR.",
        priority: Priority.CRITICAL,
        category: Category.INFRASTRUCTURE,
        status: Status.APPROVED,
        requesterId: admin.id,
        assigneeId: admin.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Build data migration tool for legacy records",
        description:
          "Need a CLI tool to import historical feature requests from the old spreadsheet system. ~2,400 records with attachments.",
        priority: Priority.LOW,
        category: Category.DATA,
        status: Status.SUBMITTED,
        requesterId: requester.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Add request priority SLA tracking",
        description:
          "Track whether requests are resolved within SLA based on priority. Critical: 24h, High: 3 days, Medium: 1 week, Low: 2 weeks.",
        priority: Priority.MEDIUM,
        category: Category.BACKEND,
        status: Status.UNDER_REVIEW,
        requesterId: requester.id,
        assigneeId: reviewer.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Redesign request submission form",
        description:
          "Current form is a single long page. Break into a multi-step wizard with validation at each step. Add file attachment support.",
        priority: Priority.LOW,
        category: Category.FRONTEND,
        status: Status.REJECTED,
        requesterId: requester.id,
        assigneeId: reviewer.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Set up automated database backups",
        description:
          "Configure daily automated backups of the PostgreSQL database to S3. Include point-in-time recovery capability. Retention: 30 days.",
        priority: Priority.CRITICAL,
        category: Category.INFRASTRUCTURE,
        status: Status.DONE,
        requesterId: admin.id,
        assigneeId: admin.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Add analytics dashboard for request metrics",
        description:
          "Management wants a dashboard showing: requests by status over time, average resolution time by priority, top requesters, category breakdown.",
        priority: Priority.MEDIUM,
        category: Category.DATA,
        status: Status.SUBMITTED,
        requesterId: admin.id,
      },
    }),
    prisma.request.create({
      data: {
        title: "Emergency: Production API gateway failing",
        description:
          "The main API gateway is intermittently returning 502 errors. Affecting approximately 15% of all API calls. Need immediate investigation and fix.",
        priority: Priority.CRITICAL,
        category: Category.INFRASTRUCTURE,
        status: Status.SUBMITTED,
        requesterId: requester.id,
      },
    }),
  ]);

  // Add comments to some requests
  await prisma.comment.createMany({
    data: [
      {
        body: "This is critical for the new team onboarding in Q3. Can we prioritize?",
        requestId: requests[1].id,
        authorId: admin.id,
      },
      {
        body: "I've started evaluating Okta vs Auth0. Will share findings by EOW.",
        requestId: requests[1].id,
        authorId: reviewer.id,
      },
      {
        body: "CSV export should include a date range filter. Don't want to dump all records every time.",
        requestId: requests[2].id,
        authorId: requester.id,
      },
      {
        body: "Migration plan drafted. Blue-green deployment with 4-hour maintenance window.",
        requestId: requests[3].id,
        authorId: admin.id,
      },
      {
        body: "Fixed in PR #47. Using Intl.DateTimeFormat for proper timezone conversion.",
        requestId: requests[4].id,
        authorId: reviewer.id,
      },
      {
        body: "Deprioritizing this — the current form works fine. We'll revisit in Q4.",
        requestId: requests[9].id,
        authorId: reviewer.id,
      },
    ],
  });

  console.log("Seed complete:");
  console.log(`  - ${3} users`);
  console.log(`  - ${requests.length} requests`);
  console.log(`  - 6 comments`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
