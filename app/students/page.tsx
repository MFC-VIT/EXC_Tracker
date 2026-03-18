import { importStudentsAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatHours } from "@/lib/format";

export default async function StudentsPage() {
  const session = await requireSession();
  const students = await db.student.findMany({
    orderBy: { name: "asc" },
    include: {
      attendanceRecords: {
        where: { status: "PRESENT" },
        include: { event: true }
      }
    }
  });

  return (
    <AppShell
      session={session}
      title="Students"
      subtitle="Manage the registered EXC cohort and track who is closing in on the 90-hour requirement."
    >
      <section className="panel-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Import Registered Students</h3>
            <p>Upload a CSV with headers: name, registrationNumber, email, phoneNumber, department, year, notes.</p>
          </div>
          <form action={importStudentsAction} className="stack">
            <label>
              Student CSV
              <input type="file" name="csvFile" accept=".csv" required />
            </label>
            <button type="submit" className="primary-button">
              Import / update students
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Completion Snapshot</h3>
            <p>Students are considered complete at 90.0 hours or more.</p>
          </div>
          <div className="list compact">
            <div className="list-item">
              <strong>{students.length}</strong>
              <p className="muted">Total registered students in the EXC roster.</p>
            </div>
            <div className="list-item">
              <strong>
                {
                  students.filter((student) => {
                    const minutes = student.attendanceRecords.reduce((sum, record) => {
                      return sum + (record.attendedMinutes ?? record.event.durationMinutes);
                    }, 0);
                    return minutes >= 90 * 60;
                  }).length
                }
              </strong>
              <p className="muted">Students who have already completed the hour target.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h3>Student Progress</h3>
          <p>Use this list to identify students who need more sessions.</p>
        </div>
        <div className="student-table">
          <div className="student-head">
            <span>Name</span>
            <span>Registration</span>
            <span>Contact</span>
            <span>Hours</span>
            <span>Status</span>
          </div>
          {students.map((student) => {
            const minutes = student.attendanceRecords.reduce((sum, record) => {
              return sum + (record.attendedMinutes ?? record.event.durationMinutes);
            }, 0);
            const completed = minutes >= 90 * 60;

            return (
              <div className="student-row" key={student.registrationNumber}>
                <div>
                  <strong>{student.name}</strong>
                  <p className="muted">
                    {student.department || "Department not set"}
                    {student.year ? ` • Year ${student.year}` : ""}
                  </p>
                </div>
                <div>{student.registrationNumber}</div>
                <div>
                  <p>{student.email}</p>
                  <p className="muted">{student.phoneNumber || "No phone number"}</p>
                </div>
                <div>{formatHours(minutes)}</div>
                <div>
                  <span className={`pill ${completed ? "success-pill" : "warning-pill"}`}>
                    {completed ? "Completed" : "In progress"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
