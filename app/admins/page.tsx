import { createAdminAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { requireSuperAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminsPage() {
  const session = await requireSuperAdmin();
  const admins = await db.adminUser.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "asc" }]
  });

  return (
    <AppShell
      session={session}
      title="Admins"
      subtitle="Manage privileged access for the club members who run the EXC course and maintain attendance."
    >
      <section className="panel-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Create Admin User</h3>
            <p>Use this only for trusted club members who should manage events and attendance.</p>
          </div>
          <form action={createAdminAction} className="stack">
            <label>
              Full Name
              <input name="name" placeholder="Club core member" required />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="member@vitstudent.ac.in" required />
            </label>
            <label>
              Password
              <input name="password" type="password" minLength={8} required />
            </label>
            <label>
              Role
              <select name="role" defaultValue="ADMIN">
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </label>
            <button type="submit" className="primary-button">
              Create admin
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Current Admin Access</h3>
            <p>Keep this list intentionally small.</p>
          </div>
          <div className="list">
            {admins.map((admin) => (
              <article key={admin.id} className="list-item">
                <div>
                  <strong>{admin.name}</strong>
                  <p className="muted">{admin.email}</p>
                </div>
                <div className="pill">{admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
