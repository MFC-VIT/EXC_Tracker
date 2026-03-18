import Link from "next/link";

import { loginAction } from "@/app/actions";
import { getSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();

  if (session) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Already signed in</h1>
          <p className="muted">Continue to the admin dashboard.</p>
          <Link href="/dashboard" className="primary-button">
            Open dashboard
          </Link>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <div className="login-screen">
      <div className="hero-panel">
        <p className="eyebrow">Mozilla Firefox Club, VIT Vellore</p>
        <h1>Track EXC attendance without spreadsheet drift.</h1>
        <p className="subtitle">
          Create course events, mark attendance, import registered students, and
          monitor progress against the 90-hour requirement.
        </p>
        <div className="hero-grid">
          <div className="feature-card">
            <strong>Attendance in minutes</strong>
            <span>
              Store event duration and actual participation accurately.
            </span>
          </div>
          <div className="feature-card">
            <strong>CSV student import</strong>
            <span>
              Seed your registered EXC cohort directly from a roster export.
            </span>
          </div>
          <div className="feature-card">
            <strong>Admin RBAC</strong>
            <span>
              Keep event operations limited to designated club members.
            </span>
          </div>
        </div>
      </div>

      <div className="login-card">
        <div>
          <p className="eyebrow">Admin Access</p>
          <h2>Sign in</h2>
          <p className="muted">
            Use an admin account from the seeded database.
          </p>
        </div>

        <form action={loginAction} className="stack">
          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="admin@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              required
            />
          </label>
          {error === "invalid" ? (
            <p className="error-text">Invalid email or password.</p>
          ) : null}
          <button type="submit" className="primary-button">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
