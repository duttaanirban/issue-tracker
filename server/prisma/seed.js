import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.issueHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const alex = await prisma.user.create({
    data: { name: 'Alex Johnson', email: 'alex@company.com', avatarUrl: 'https://i.pravatar.cc/150?u=alex' }
  });

  const devon = await prisma.user.create({
    data: { name: 'Devon Smith', email: 'devon@company.com', avatarUrl: 'https://i.pravatar.cc/150?u=devon' }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Core Platform',
      key: 'PLAT',
      members: {
        create: [{ userId: alex.id }, { userId: devon.id }]
      }
    }
  });

  const statuses = ['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'CLOSED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const types = ['BUG', 'TASK'];

  for (let i = 1; i <= 15; i++) {
    await prisma.issue.create({
      data: {
        title: `Issue #${i}: ${types[i % 2]} sample task for workflow verification`,
        description: `### Steps to reproduce\n1. Log into portal\n2. Trigger item **#${i}**\n\n*Expected result:* Action completes cleanly.`,
        type: types[i % 2],
        priority: priorities[i % 4],
        status: statuses[i % 4],
        labels: i % 2 === 0 ? ['frontend', 'ui'] : ['backend', 'security'],
        projectId: project.id,
        reporterId: alex.id,
        assigneeId: devon.id
      }
    });
  }

  console.log('Database seeded successfully with Demo Users & Issues.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });