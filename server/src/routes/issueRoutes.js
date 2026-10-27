import express from 'express';
import { PrismaClient } from '@prisma/client';
import { updateIssueService } from '../services/issueService.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/issues (Paginated, Filtered, Searched)
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, assigneeId, search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: Number(limit),
        include: { assignee: true, reporter: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({ issues, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
});

// GET /api/issues/:id (With History and Comments)
router.get('/:id', async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: true,
        reporter: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        history: { include: { changedBy: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/issues/:id (Update Issue & Server-Enforced Workflow)
router.patch('/:id', async (req, res, next) => {
  try {
    const { userId, ...payload } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required to track updates' });

    const updated = await updateIssueService(req.params.id, userId, payload);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;