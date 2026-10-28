import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { updateIssueService } from '../services/issueService.js';

const router = express.Router();
const prisma = new PrismaClient();

const createIssueSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  description: z.string().trim().min(1, 'description is required'),
  type: z.enum(['BUG', 'TASK']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
  projectId: z.uuid('projectId must be a valid UUID'),
  reporterId: z.uuid('reporterId must be a valid UUID'),
  assigneeId: z.uuid('assigneeId must be a valid UUID').nullable().optional(),
});

const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'content is required').max(2000),
  authorId: z.uuid('authorId must be a valid UUID'),
});

const uuidSchema = z.uuid('must be a valid UUID');

const issueIdParamsSchema = z.object({
  id: uuidSchema,
});

const listIssuesQuerySchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: uuidSchema.optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const updateIssueSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).optional(),
  type: z.enum(['BUG', 'TASK']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'CLOSED']).optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
  assigneeId: uuidSchema.nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one issue field is required',
});

function validationError(res, message, issues) {
  return res.status(400).json({
    error: message,
    details: issues.map(({ path, message: issueMessage }) => ({
      path,
      message: issueMessage,
    })),
  });
}

// POST /api/issues (Create Issue)
router.post('/', async (req, res, next) => {
  const parsed = createIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    return validationError(res, 'Invalid issue data', parsed.error.issues);
  }

  try {
    const issue = await prisma.issue.create({
      data: parsed.data,
      include: { assignee: true, reporter: true },
    });
    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
});

// POST /api/issues/:id/comments (Create Comment)
router.post('/:id/comments', async (req, res, next) => {
  const params = issueIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    return validationError(res, 'Invalid issue ID', params.error.issues);
  }

  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return validationError(res, 'Invalid comment data', parsed.error.issues);
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        authorId: parsed.data.authorId,
        issueId: params.data.id,
      },
      include: { author: true },
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// GET /api/issues (Paginated, Filtered, Searched)
router.get('/', async (req, res, next) => {
  const parsedQuery = listIssuesQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return validationError(res, 'Invalid issue filters', parsedQuery.error.issues);
  }

  try {
    const { status, priority, assigneeId, search, page, limit } = parsedQuery.data;
    const skip = (page - 1) * limit;

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
        take: limit,
        include: { assignee: true, reporter: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({ issues, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/issues/:id (With History and Comments)
router.get('/:id', async (req, res, next) => {
  const params = issueIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    return validationError(res, 'Invalid issue ID', params.error.issues);
  }

  try {
    const issue = await prisma.issue.findUnique({
      where: { id: params.data.id },
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
  const params = issueIdParamsSchema.safeParse(req.params);
  if (!params.success) {
    return validationError(res, 'Invalid issue ID', params.error.issues);
  }

  try {
    const { userId, ...payload } = req.body;
    const actor = uuidSchema.safeParse(userId);
    if (!actor.success) {
      return validationError(res, 'Invalid userId', actor.error.issues);
    }

    const parsedPayload = updateIssueSchema.safeParse(payload);
    if (!parsedPayload.success) {
      return validationError(res, 'Invalid issue update', parsedPayload.error.issues);
    }

    const updated = await updateIssueService(params.data.id, actor.data, parsedPayload.data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;