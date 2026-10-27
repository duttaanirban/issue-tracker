import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Backend Workflow & History Tests', () => {
  let demoUser, demoProject, demoIssue;

  beforeAll(async () => {
    demoUser = await prisma.user.create({
      data: { name: 'Test User', email: `test-${Date.now()}@example.com` }
    });
    demoProject = await prisma.project.create({
      data: { name: 'Test Project', key: `TP-${Date.now()}` }
    });
  });

  beforeEach(async () => {
    demoIssue = await prisma.issue.create({
      data: {
        title: 'Initial Bug',
        description: 'Testing workflow',
        status: 'OPEN',
        projectId: demoProject.id,
        reporterId: demoUser.id
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Valid transition: OPEN -> IN_PROGRESS succeeds', async () => {
    const res = await request(app)
      .patch(`/api/issues/${demoIssue.id}`)
      .send({ status: 'IN_PROGRESS', userId: demoUser.id });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  test('2. Server rejects illegal transition: OPEN -> CLOSED', async () => {
    const res = await request(app)
      .patch(`/api/issues/${demoIssue.id}`)
      .send({ status: 'CLOSED', userId: demoUser.id });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Invalid workflow move/i);
  });

  test('3. Audit history automatically creates change records', async () => {
    await request(app)
      .patch(`/api/issues/${demoIssue.id}`)
      .send({ status: 'IN_PROGRESS', priority: 'HIGH', userId: demoUser.id });

    const history = await prisma.issueHistory.findMany({
      where: { issueId: demoIssue.id }
    });

    expect(history.length).toBe(2);
    const statusChange = history.find((h) => h.fieldName === 'status');
    expect(statusChange.oldValue).toBe('OPEN');
    expect(statusChange.newValue).toBe('IN_PROGRESS');
  });

  test('4. Direct API updates record field diffs reliably', async () => {
    await request(app)
      .patch(`/api/issues/${demoIssue.id}`)
      .send({ title: 'Updated Title', userId: demoUser.id });

    const history = await prisma.issueHistory.findFirst({
      where: { issueId: demoIssue.id, fieldName: 'title' }
    });

    expect(history).not.toBeNull();
    expect(history.oldValue).toBe('Initial Bug');
    expect(history.newValue).toBe('Updated Title');
  });

  test('5. Reopening from CLOSED -> OPEN succeeds', async () => {
    // Manually force status to CLOSED
    await prisma.issue.update({ where: { id: demoIssue.id }, data: { status: 'CLOSED' } });

    const res = await request(app)
      .patch(`/api/issues/${demoIssue.id}`)
      .send({ status: 'OPEN', userId: demoUser.id });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OPEN');
  });
});