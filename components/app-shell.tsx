import Link from "next/link";
import { ReactNode } from "react";

import { logoutAction } from "@/app/actions";
import { SessionPayload } from "@/lib/auth";

export function AppShell({
  session,
  title,
  subtitle,
  children
}: {
  session: SessionPayload;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/events", label: "Events" },
    { href: "/students", label: "Students" },
    ...(session.role === "SUPER_ADMIN" ? [{ href: "/admins", label: "Admins" }] : [])
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Mozilla Firefox Club</p>
          <h1>EXC Tracker</h1>
          <p className="muted">Attendance and hour completion for club-run EXC courses.</p>
        </div>

        <nav className="nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="profile-card">
          <div>
            <p className="profile-name">{session.name}</p>
            <p className="muted">{session.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</p>
          </div>
          <form action={logoutAction}>
            <button className="ghost-button" type="submit">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Club Operations</p>
            <h2>{title}</h2>
          </div>
          <p className="subtitle">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
