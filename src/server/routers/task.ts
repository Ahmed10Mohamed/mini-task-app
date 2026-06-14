import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '../db';

const taskTitleSchema = z.string().trim().min(1).max(100);

export const taskRouter = router({
  list: publicProcedure.query(() =>
    prisma.task.findMany({ orderBy: { createdAt: 'desc' } }),
  ),

  create: publicProcedure
    .input(z.object({ title: taskTitleSchema }))
    .mutation(({ input }) =>
      prisma.task.create({ data: { title: input.title } }),
    ),

  update: publicProcedure
    .input(z.object({ id: z.string().min(1), title: taskTitleSchema }))
    .mutation(({ input }) =>
      prisma.task.update({
        where: { id: input.id },
        data: { title: input.title },
      }),
    ),

  toggle: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const task = await prisma.task.findUniqueOrThrow({
        where: { id: input.id },
      });

      return prisma.task.update({
        where: { id: input.id },
        data: { done: !task.done },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ input }) => prisma.task.delete({ where: { id: input.id } })),
});
