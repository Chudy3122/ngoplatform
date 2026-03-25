import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const ADMIN_PASSWORD = "Mateusz@Admin25";
const NGO_PASSWORD = "Platforma@2025";

const adminAccount = {
  username: "mateusz",
  name: "Mateusz",
  email: "mateusz.ctb10@gmail.com",
};

const ngoAccounts = [
  { email: "srdtatary@gmail.com",                   username: "srdtatary",             orgName: "Stowarzyszenia Rozwoju Dzielnicy Tatary" },
  { email: "katarzyna.szablowska@sdp.pl",            username: "katarzyna_szablowska",  orgName: "Stowarzyszenie Dziennikarzy Polskich - Kazimierz Dolny" },
  { email: "fundacja.obok.nas@onet.pl",              username: "fundacja_obok_nas",     orgName: "Fundacja Obok Nas" },
  { email: "fundacja.rosenwertha@gmail.com",         username: "fundacja_rosenwertha",  orgName: "Fundacja Im. Stanislawa Rosenwertha" },
  { email: "kgigw.nowykrepiec@gmail.com",            username: "kgigw_nowykrepiec",     orgName: "Kolo Gospodyń i Gospodarzy Wiejskich ZIELONY ZAKATEK w Nowy Krepiec" },
  { email: "poczta@lubfor.art",                      username: "poczta_lubfor",         orgName: "Lubelska Formacja Artystyczna" },
  { email: "lublin@pck.pl",                          username: "lublin_pck",            orgName: "Lubelski Oddzial Okregowy PCK" },
  { email: "zarzad@los.lublin.pl",                   username: "zarzad_los",            orgName: "Lubelski Osrodek Samopomocy" },
  { email: "miejsceslawinek@gmail.com",              username: "miejsceslawinek",       orgName: "Nasze Miejsce na Slawinku - Miejsce Aktywnosci Lokalnej" },
  { email: "zarzad@ptm.lublin.pl",                   username: "zarzad_ptm",            orgName: "Polskie Towarzystwo Mieszkaniowe Lublin" },
  { email: "oddzial.chelm@pzeir-chelm.pl",           username: "oddzial_chelm",         orgName: "Polski Zwiazek Emerytow i Rencistow" },
  { email: "wokolbystrej@o2.pl",                     username: "wokolbystrej",          orgName: "Regionalne Stowarzyszenie Odnowy i Rozwoju Wokol Bystrej" },
  { email: "sssimpuls@gmail.com",                    username: "sssimpuls",             orgName: "SPOLDZIELNIA SOCJALNA SIMPULS" },
  { email: "przeszloscprzyszlosci@o2.pl",            username: "przeszloscprzyszlosc",  orgName: "Stowarzyszenie Przeszlosc - Przyszlosci" },
  { email: "m.malawska@odraniemen.org",              username: "m_malawska",            orgName: "Stowarzyszenie Odra-Niemen Lublin" },
  { email: "kontakt@tpgolab.pl",                     username: "kontakt_tpgolab",       orgName: "Towarzystwo Przyjaciol Golebia" },
  { email: "fundacjastopwykluczeniu@gmail.com",      username: "fundacjastopwyklucze",  orgName: "Fundacja Stop Wykluczeniu" },
  { email: "asystent@fsmm.pl",                       username: "asystent_fsmm",         orgName: "Fundacja Studencka Mlodzi-Mlodym" },
  { email: "dajemypomoc@gmail.com",                  username: "dajemypomoc",           orgName: "Fundacja Dajemy Pomoc Lublin" },
  { email: "sebastian.trusz@hf.org.pl",              username: "sebastian_trusz",       orgName: "Homo Faber" },
  { email: "biuro@fundacjaasdreamer.pl",             username: "biuro_asdreamer",       orgName: "As Dreamer" },
  { email: "biuro@my-ps.eu",                         username: "biuro_myps",            orgName: "FUNDACJA MY PERSONALITY SKILLS" },
  { email: "k.romaniszyn@romaniszyn.com.pl",         username: "k_romaniszyn",          orgName: "Fundacja Bezkresny Horyzont" },
  { email: "kontakt.actio@gmail.com",                username: "kontakt_actio",         orgName: "Fundacja ACTIO" },
];

async function createAdminAccount() {
  const existing = await prisma.user.findFirst({
    where: { email: adminAccount.email },
  });
  if (existing) {
    console.log(`⏭  Admin ${adminAccount.email} already exists, skipping`);
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
  const admin = await prisma.admin.create({
    data: {
      username: adminAccount.username,
      name: adminAccount.name,
      email: adminAccount.email,
    },
  });

  await prisma.user.create({
    data: {
      username: adminAccount.username,
      password: hashed,
      email: adminAccount.email,
      role: "ADMIN",
      roleId: admin.id,
    },
  });

  console.log(`✓  ADMIN created: ${adminAccount.username} / ${ADMIN_PASSWORD}`);
}

async function createNgoAccounts() {
  const hashed = await bcrypt.hash(NGO_PASSWORD, SALT_ROUNDS);
  let phoneCounter = 1;

  for (const acc of ngoAccounts) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username: acc.username }, { email: acc.email }] },
    });
    if (existingUser) {
      console.log(`⏭  ${acc.username} already exists, skipping`);
      phoneCounter++;
      continue;
    }

    const phone = `+48NGO${String(phoneCounter).padStart(4, "0")}`;
    phoneCounter++;

    try {
      const parent = await prisma.parent.create({
        data: {
          username: acc.username,
          name: acc.orgName.substring(0, 100),
          surname: ".",
          email: acc.email,
          phone: phone,
          address: "Lublin",
        },
      });

      await prisma.user.create({
        data: {
          username: acc.username,
          password: hashed,
          email: acc.email,
          role: "USER",
          roleId: parent.id,
        },
      });

      console.log(`✓  ${acc.username.padEnd(25)} ${acc.email}`);
    } catch (err: any) {
      console.error(`✗  ${acc.username}: ${err.message}`);
    }
  }
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seed: konta NGO i Admin");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await createAdminAccount();

  console.log("\nTworzenie kont NGO...\n");
  await createNgoAccounts();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  GOTOWE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Admin:    mateusz / ${ADMIN_PASSWORD}`);
  console.log(`  NGO:      [username z listy] / ${NGO_PASSWORD}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((err) => {
    console.error("Błąd:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
