// src/lib/db.ts

import { PrismaClient } from '@prisma/client'; // lub inny klient bazy danych, którego używasz

const prisma = new PrismaClient();

export default prisma;
