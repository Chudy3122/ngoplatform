import { PrismaClient, UserSex } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    // Wyczyść dane w odpowiedniej kolejności
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.class.deleteMany();
    await prisma.grade.deleteMany();

    console.log('Cleaned up old data');

    // 1. Najpierw tworzymy Grade i sprawdzamy czy został utworzony
    const grade = await prisma.grade.create({
      data: {
        level: 1
      }
    });
    console.log('Created grade:', grade);

    // 2. Tworzymy nauczyciela, który będzie supervisorem klasy
    const teacher = await prisma.teacher.create({
      data: {
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
      }
    });
    console.log('Created teacher:', teacher);

    // 3. Tworzymy klasę i przypisujemy do niej nauczyciela i poziom
    const class1 = await prisma.class.create({
      data: {
        name: "1A",
        capacity: 30,
        gradeId: grade.id,
        supervisorId: teacher.id
      }
    });
    console.log('Created class:', class1);

    // 4. Tworzymy rodzica
    const parent = await prisma.parent.create({
      data: {
        id: "parent1",
        username: "parent",
        name: "Mike",
        surname: "Johnson",
        email: "parent@example.com",
        phone: "987654321",
        address: "456 Home St"
      }
    });
    console.log('Created parent:', parent);

    // 5. Tworzymy studenta i łączymy go z klasą, rodzicem i poziomem
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

    // 6. Tworzymy admina
    const admin = await prisma.admin.create({
      data: {
        id: "admin1",
        username: "admin",
        name: "Admin",
        email: "admin@example.com"
      }
    });
    console.log('Created admin:', admin);

    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });