import Link from "next/link";

import { createEventAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatHours } from "@/lib/format";

export default async function EventsPage() {
  const session = await requireSession();
  const events = await db.clubEvent.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      createdBy: true,
      attendanceRecords: {
        where: { status: "PRESENT" }
      }
    }
  });

  return (
    <AppShell
      session={session}
      title="Events"
      subtitle="Create EXC sessions and open each event to mark attendance against the registered roster."
    >
      <section className="panel-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Create Event</h3>
            <p>Capture the session details once, then use the event page to mark attendance.</p>
          </div>
          <form action={createEventAction} className="stack">
            <label>
              Event Name
              <input name="title" placeholder="React Hooks Deep Dive" required />
            </label>
            <label>
              Venue
              <input name="venue" placeholder="TT 302" required />
            </label>
            <label>
              Category
              <input name="category" placeholder="Workshop / Hacknight / Mentoring" required />
            </label>
            <label>
              Start Date & Time
              <input name="startsAt" type="datetime-local" required />
            </label>
            <label>
              Duration (minutes)
              <input name="durationMinutes" type="number" min="15" step="15" placeholder="120" required />
            </label>
            <label>
              Notes
              <textarea name="description" rows={4} placeholder="Optional context for the session." />
            </label>
            <button type="submit" className="primary-button">
              Create event
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Event Log</h3>
            <p>Open an event to mark attendance or update existing records.</p>
          </div>
          <div className="list">
            {events.length === 0 ? (
              <p className="muted">No events yet.</p>
            ) : (
              events.map((event) => (
                <article key={event.id} className="list-item">
                  <div>
                    <strong>{event.title}</strong>
                    <p className="muted">
                      {event.category} • {event.venue}
                    </p>
                    <p className="muted">
                      {formatDateTime(event.startsAt)} • {formatHours(event.durationMinutes)}
                    </p>
                    <p className="muted">Created by {event.createdBy.name}</p>
                  </div>
                  <div className="actions">
                    <span className="pill">{event.attendanceRecords.length} present</span>
                    <Link href={`/events/${event.id}`} className="secondary-button">
                      Open
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
