"use server";

import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { AdminRole, AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession, createSession, requireSession, requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(formData: FormData) {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  const user = await db.adminUser.findUnique({
    where: { email }
  });

  if (!user) {
    redirect("/login?error=invalid");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    redirect("/login?error=invalid");
  }

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createEventAction(formData: FormData) {
  const session = await requireSession();
  const title = readString(formData, "title");
  const venue = readString(formData, "venue");
  const category = readString(formData, "category");
  const startsAt = readString(formData, "startsAt");
  const description = readString(formData, "description");
  const durationMinutes = Number(readString(formData, "durationMinutes"));

  if (!title || !venue || !category || !startsAt || !durationMinutes) {
    redirect("/events?error=missing");
  }

  await db.clubEvent.create({
    data: {
      title,
      venue,
      category,
      description: description || null,
      startsAt: new Date(startsAt),
      durationMinutes,
      createdById: session.userId
    }
  });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect("/events");
}

export async function updateAttendanceAction(formData: FormData) {
  await requireSession();
  const eventId = readString(formData, "eventId");
  const studentIds = formData.getAll("studentId").map(String);

  for (const studentId of studentIds) {
    const status =
      readString(formData, `status_${studentId}`) === "PRESENT"
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.ABSENT;
    const attendedMinutes = Number(readString(formData, `minutes_${studentId}`));

    await db.attendanceRecord.upsert({
      where: {
        eventId_studentId: {
          eventId,
          studentId
        }
      },
      update: {
        status,
        attendedMinutes: status === "PRESENT" ? attendedMinutes || null : null,
        markedAt: new Date()
      },
      create: {
        eventId,
        studentId,
        status,
        attendedMinutes: status === "PRESENT" ? attendedMinutes || null : null
      }
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  revalidatePath("/students");
}

export async function importStudentsAction(formData: FormData) {
  await requireSession();
  const csvFile = formData.get("csvFile");

  if (!(csvFile instanceof File)) {
    redirect("/students?error=file");
  }

  const csvText = await csvFile.text();
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Array<Record<string, string>>;

  for (const row of rows) {
    const registrationNumber = row.registrationNumber?.trim();
    const name = row.name?.trim();
    const email = row.email?.trim().toLowerCase();

    if (!registrationNumber || !name || !email) {
      continue;
    }

    await db.student.upsert({
      where: { registrationNumber },
      update: {
        name,
        email,
        phoneNumber: row.phoneNumber?.trim() || null,
        department: row.department?.trim() || null,
        year: row.year ? Number(row.year) : null,
        notes: row.notes?.trim() || null
      },
      create: {
        registrationNumber,
        name,
        email,
        phoneNumber: row.phoneNumber?.trim() || null,
        department: row.department?.trim() || null,
        year: row.year ? Number(row.year) : null,
        notes: row.notes?.trim() || null
      }
    });
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
  redirect("/students");
}

export async function createAdminAction(formData: FormData) {
  await requireSuperAdmin();
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const role =
    readString(formData, "role") === "SUPER_ADMIN" ? AdminRole.SUPER_ADMIN : AdminRole.ADMIN;

  if (!name || !email || password.length < 8) {
    redirect("/admins?error=invalid");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role
    }
  });

  revalidatePath("/admins");
  redirect("/admins");
}
