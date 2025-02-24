import { PrismaClient, UserSex, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const seedData = {
  grade: {
    level: 1
  },
  teacher: {
    id: "teacher1",
    username: "teacher",
    name: "John",
    surname: "Smith",
    email: "teacher@example.com",
    phone: "123456789",
    address: "123 School St",
    bloodType: "A+",
    sex: "MALE" as UserSex,
    birthday: new Date("1980-01-01")
  },
  parent: {
    id: "parent1",
    username: "parent",
    name: "Mike",
    surname: "Johnson",
    email: "parent@example.com",
    phone: "987654321",
    address: "456 Home St"
  },
  admin: {
    id: "admin1",
    username: "admin",
    name: "Admin",
    email: "admin@example.com"
  }
} as const;

async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log('Error while cleaning database:', error);
  }
}

async function main() {
  try {
    console.log('Start seeding...');
    
    // Czyszczenie bazy danych
    await cleanDatabase();
    console.log('Database cleaned');

    // Tworzenie grade
    const grade = await prisma.grade.create({
      data: seedData.grade
    });
    console.log('Created grade:', grade);

    // Tworzenie nauczyciela
    const teacher = await prisma.teacher.create({
      data: seedData.teacher
    });
    console.log('Created teacher:', teacher);

    // Tworzenie klasy
    const class1 = await prisma.class.create({
      data: {
        name: "1A",
        capacity: 30,
        gradeId: grade.id,
        supervisorId: teacher.id
      }
    });
    console.log('Created class:', class1);

    // Tworzenie rodzica
    const parent = await prisma.parent.create({
      data: seedData.parent
    });
    console.log('Created parent:', parent);

    // Tworzenie studenta
    const student = await prisma.student.create({
      data: {
        id: "student1",
        username: "student",
        name: "Tom",
        surname: "Johnson",
        email: "student@example.com",
        phone: "123123123",
        address: "456 Home St",
        bloodType: "B+",
        sex: "MALE" as UserSex,
        birthday: new Date("2010-01-01"),
        parentId: parent.id,
        classId: class1.id,
        gradeId: grade.id
      }
    });
    console.log('Created student:', student);

    // Tworzenie admina
    const admin = await prisma.admin.create({
      data: seedData.admin
    });
    console.log('Created admin:', admin);

    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Error in seed script:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}