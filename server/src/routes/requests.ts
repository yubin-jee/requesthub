import { Router } from "express";
import { PrismaClient, Status } from "@prisma/client";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";

const prisma = new PrismaClient();
export const requestsRouter = Router();

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  category: z.enum(["FRONTEND", "BACKEND", "INFRASTRUCTURE", "DATA"]),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  category: z.enum(["FRONTEND", "BACKEND", "INFRASTRUCTURE", "DATA"]).optional(),
});

const statusSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "IN_PROGRESS", "DONE"]),
});

const commentSchema = z.object({
  body: z.string().min(1),
});

const VALID_TRANSITIONS: Record<Status, Status[]> = {
  SUBMITTED: [Status.UNDER_REVIEW],
  UNDER_REVIEW: [Status.APPROVED, Status.REJECTED],
  APPROVED: [Status.IN_PROGRESS],
  REJECTED: [],
  IN_PROGRESS: [Status.DONE],
  DONE: [],
};

// List requests
requestsRouter.get("/", async (req, res) => {
  const { status, priority, category, sort } = req.query;

  const where: Record<string, string> = {};
  if (status && typeof status === "string") where.status = status;
  if (priority && typeof priority === "string") where.priority = priority;
  if (category && typeof category === "string") where.category = category;

  const orderBy: Record<string, string> =
    sort === "priority"
      ? { priority: "asc" }
      : sort === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };

  const requests = await prisma.request.findMany({
    where,
    orderBy,
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
  });

  res.json(requests);
});

// Get single request
requestsRouter.get("/:id", async (req, res) => {
  const request = await prisma.request.findUnique({
    where: { id: req.params.id },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  res.json(request);
});

// Create request
requestsRouter.post("/", authenticate, async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    const request = await prisma.request.create({
      data: {
        ...data,
        requesterId: req.user!.userId,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(request);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    throw err;
  }
});

// Update request
requestsRouter.patch("/:id", authenticate, async (req, res) => {
  try {
    const data = updateSchema.parse(req.body);
    const request = await prisma.request.update({
      where: { id: req.params.id },
      data,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(request);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    throw err;
  }
});

// Transition status
requestsRouter.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status: newStatus } = statusSchema.parse(req.body);
    const request = await prisma.request.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (!VALID_TRANSITIONS[request.status].includes(newStatus)) {
      res.status(400).json({
        error: `Cannot transition from ${request.status} to ${newStatus}`,
      });
      return;
    }

    const updated = await prisma.request.update({
      where: { id: req.params.id },
      data: {
        status: newStatus,
        assigneeId:
          newStatus === "UNDER_REVIEW" ? req.user!.userId : undefined,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    throw err;
  }
});

// List comments
requestsRouter.get("/:id/comments", async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { requestId: req.params.id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.json(comments);
});

// Add comment
requestsRouter.post("/:id/comments", authenticate, async (req, res) => {
  try {
    const { body } = commentSchema.parse(req.body);
    const comment = await prisma.comment.create({
      data: {
        body,
        requestId: req.params.id,
        authorId: req.user!.userId,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    res.status(201).json(comment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    throw err;
  }
});
