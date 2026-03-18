import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatHours } from "@/lib/format";

export default async function DashboardPage() {
  const session = await requireSession();

  const [studentCount, eventCount, adminCount, attendance, upcomingEvents] = await Promise.all([
    db.student.count(),
    db.clubEvent.count(),
    db.adminUser.count(),
    db.attendanceRecord.findMany({
      where: { status: "PRESENT" },
      include: { student: true, event: true }
    }),
    db.clubEvent.findMany({
      orderBy: { startsAt: "asc" },
      take: 5,
      include: { attendanceRecords: true }
    })
  ]);

  const totalMinutes = attendance.reduce((sum, record) => {
    return sum + (record.attendedMinutes ?? record.event.durationMinutes);
  }, 0);

  const studentHours = new Map<string, number>();
  for (const record of attendance) {
    const earned = record.attendedMinutes ?? record.event.durationMinutes;
    studentHours.set(record.studentId, (studentHours.get(record.studentId) ?? 0) + earned);
  }

  const completionCount = [...studentHours.values()].filter((minutes) => minutes >= 90 * 60).length;

  return (
    <AppShell
      session={session}
      title="Dashboard"
      subtitle="A quick view of EXC participation, progress toward 90 hours, and the next events to manage."
    >
      <section className="stats-grid">
        <div className="stat-card accent-orange">
          <span>Total Students</span>
          <strong>{studentCount}</strong>
        </div>
        <div className="stat-card accent-blue">
          <span>Events Logged</span>
          <strong>{eventCount}</strong>
        </div>
        <div className="stat-card accent-green">
          <span>Total Hours Delivered</span>
          <strong>{formatHours(totalMinutes)}</strong>
        </div>
        <div className="stat-card accent-rose">
          <span>Students at 90h</span>
          <strong>{completionCount}</strong>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Upcoming Events</h3>
            <p>Recent events and attendance coverage.</p>
          </div>
          <div className="list">
            {upcomingEvents.length === 0 ? (
              <p className="muted">No events created yet.</p>
            ) : (
              upcomingEvents.map((event) => (
                <article key={event.id} className="list-item">
                  <div>
                    <strong>{event.title}</strong>
                    <p className="muted">
                      {event.venue} • {formatDateTime(event.startsAt)}
                    </p>
                  </div>
                  <div className="pill">{event.attendanceRecords.length} marked</div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>How it works</h3>
            <p>Recommended workflow for the club ops team.</p>
          </div>
          <div className="list compact">
            <div className="list-item">
              <strong>1. Import the EXC roster</strong>
              <p className="muted">Upload the registered student CSV on the Students page.</p>
            </div>
            <div className="list-item">
              <strong>2. Create each club event</strong>
              <p className="muted">Store venue, date, duration, and category for auditability.</p>
            </div>
            <div className="list-item">
              <strong>3. Mark attendance after the session</strong>
              <p className="muted">Record presence and actual attended minutes for each student.</p>
            </div>
          </div>
          <div className="panel-footer">
            <span>{adminCount} admins currently have access.</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
