import { PrismaClient, Prisma } from "../../generated/prisma";

const prisma = new PrismaClient().$extends({
    model: {
      $allModels: {
        async exists<T>(
          this: T,
          where: Prisma.Args<T, 'findFirst'>['where']
        ): Promise<boolean> {
          // Get the current model at runtime
          const context = Prisma.getExtensionContext(this)
  
          const result = await (context as any).findFirst({ where })
          return result !== null
        },
      },
    },
});

export default prisma;