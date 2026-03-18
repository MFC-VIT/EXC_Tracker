import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { PrismaClient, AdminRole } from "@prisma/client";

const prisma = new PrismaClient();

type CsvRow = {
  name: string;
  registrationNumber: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  year?: string;
  notes?: string;
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@vitstudent.ac.in";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const name = process.env.ADMIN_NAME ?? "EXC Super Admin";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash, role: AdminRole.SUPER_ADMIN },
    create: {
      email,
      name,
      passwordHash,
      role: AdminRole.SUPER_ADMIN
    }
  });
}

async function seedStudents() {
  const csvPath = resolve(process.cwd(), "data", "students.csv");
  const fallbackPath = resolve(process.cwd(), "data", "students.example.csv");
  const sourcePath = existsSync(csvPath) ? csvPath : fallbackPath;

  if (!existsSync(sourcePath)) {
    return;
  }

  const file = readFileSync(sourcePath, "utf8");
  const rows = parse(file, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CsvRow[];

  for (const row of rows) {
    if (!row.registrationNumber || !row.email || !row.name) {
      continue;
    }

    await prisma.student.upsert({
      where: { registrationNumber: row.registrationNumber },
      update: {
        name: row.name,
        email: row.email.toLowerCase(),
        phoneNumber: row.phoneNumber || null,
        department: row.department || null,
        year: row.year ? Number(row.year) : null,
        notes: row.notes || null
      },
      create: {
        registrationNumber: row.registrationNumber,
        name: row.name,
        email: row.email.toLowerCase(),
        phoneNumber: row.phoneNumber || null,
        department: row.department || null,
        year: row.year ? Number(row.year) : null,
        notes: row.notes || null
      }
    });
  }
}

async function main() {
  await seedAdmin();
  await seedStudents();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
