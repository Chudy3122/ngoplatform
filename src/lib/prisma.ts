import { PrismaClient } from '@prisma/client'

// Funkcja zwracająca nową instancję PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient()
}

// Rozszerzenie globalThis o instancję PrismaClient
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Użycie instancji PrismaClient jako singleton
const prisma =
  globalThis.prismaGlobal ?? prismaClientSingleton()

// Eksport instancji PrismaClient
export default prisma

// Ustawienie instancji na globalną w środowisku deweloperskim
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
