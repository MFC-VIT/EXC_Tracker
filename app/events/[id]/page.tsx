import Link from "next/link";
import { notFound } from "next/navigation";

import { updateAttendanceAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function EventAttendancePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [event, students] = await Promise.all([
    db.clubEvent.findUnique({
      where: { id },
      include: { attendanceRecords: true }
    }),
    db.student.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  if (!event) {
    notFound();
  }

  const recordMap = new Map(event.attendanceRecords.map((record) => [record.studentId, record]));

  return (
    <AppShell
      session={session}
      title={event.title}
      subtitle={`${event.venue} • ${formatDateTime(event.startsAt)} • ${event.durationMinutes} mins`}
    >
      <section className="panel">
        <div className="panel-heading split">
          <div>
            <h3>Attendance Sheet</h3>
            <p>Mark presence and actual attendance minutes for each registered student.</p>
          </div>
          <Link href="/events" className="secondary-button">
            Back to events
          </Link>
        </div>

        <form action={updateAttendanceAction} className="stack">
          <input type="hidden" name="eventId" value={event.id} />
          <div className="attendance-table">
            <div className="attendance-head">
              <span>Student</span>
              <span>Reg. No.</span>
              <span>Status</span>
              <span>Minutes</span>
            </div>
            {students.map((student) => {
              const existing = recordMap.get(student.registrationNumber);
              return (
                <div className="attendance-row" key={student.registrationNumber}>
                  <input type="hidden" name="studentId" value={student.registrationNumber} />
                  <div>
                    <strong>{student.name}</strong>
                    <p className="muted">{student.email}</p>
                  </div>
                  <div>{student.registrationNumber}</div>
                  <div>
                    <select
                      name={`status_${student.registrationNumber}`}
                      defaultValue={existing?.status ?? "ABSENT"}
                    >
                      <option value="ABSENT">Absent</option>
                      <option value="PRESENT">Present</option>
                    </select>
                  </div>
                  <div>
                    <input
                      name={`minutes_${student.registrationNumber}`}
                      type="number"
                      min="0"
                      max={event.durationMinutes}
                      defaultValue={existing?.attendedMinutes ?? event.durationMinutes}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button type="submit" className="primary-button">
            Save attendance
          </button>
        </form>
      </section>
    </AppShell>
  );
}
