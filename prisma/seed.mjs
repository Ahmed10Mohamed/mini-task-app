import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.task.count();
  if (existing > 0) {
    console.log('Tasks already exist — skipping seed.');
    return;
  }
  await prisma.task.createMany({
    data: [
      { title: 'Read the README and TASK.md', done: true },
      { title: 'Implement task.create', done: false },
      { title: 'Implement task.toggle and task.delete', done: false },
    ],
  });
  console.log('Seeded 3 tasks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
