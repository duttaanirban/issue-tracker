import { PrismaClient } from '@prisma/client';
import { isValidTransition } from '../utils/workflow.js';

const prisma = new PrismaClient();

export async function updateIssueService(issueId, userId, payload) {
  return await prisma.$transaction(async (tx) => {
    // 1. Retrieve original issue state
    const currentIssue = await tx.issue.findUnique({
      where: { id: issueId }
    });

    if (!currentIssue) {
      throw { status: 404, message: 'Issue not found' };
    }

    // 2. Validate workflow status transition on the server
    if (payload.status && payload.status !== currentIssue.status) {
      if (!isValidTransition(currentIssue.status, payload.status)) {
        throw {
          status: 400,
          message: `Invalid workflow move from ${currentIssue.status} to ${payload.status}`
        };
      }
    }

    // 3. Diff changed fields and log history
    const historyRecords = [];
    const fieldsToTrack = ['title', 'description', 'type', 'priority', 'status', 'assigneeId'];

    for (const field of fieldsToTrack) {
      if (payload[field] !== undefined && payload[field] !== currentIssue[field]) {
        historyRecords.push({
          issueId,
          changedById: userId,
          fieldName: field,
          oldValue: currentIssue[field] ? String(currentIssue[field]) : 'Unassigned',
          newValue: payload[field] ? String(payload[field]) : 'Unassigned'
        });
      }
    }

    // 4. Record history logs inside the same transaction
    if (historyRecords.length > 0) {
      await tx.issueHistory.createMany({
        data: historyRecords
      });
    }

    // 5. Update issue
    return await tx.issue.update({
      where: { id: issueId },
      data: payload,
      include: {
        assignee: true,
        reporter: true,
        history: { include: { changedBy: true }, orderBy: { createdAt: 'desc' } }
      }
    });
  }, {
    maxWait: 10000,
    timeout: 15000
  });
}