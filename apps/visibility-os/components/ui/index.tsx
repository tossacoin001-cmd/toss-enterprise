import Link from "next/link";

/**
 * The small set of workspace building blocks. Each one is styled by tokens in app/workspace.css,
 * so a change to the look is a change in one place. Tests: tests/workspace/dashboard-render.test.ts.
 */

type Tone = "neutral" | "good" | "warn" | "danger" | "info" | "gold";

export function Button({
  children, href, variant = "primary", size = "normal", type = "button", className = "", ...rest
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "normal" | "small";
  type?: "button" | "submit";
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className">) {
  const cls = `ws-btn${variant === "primary" ? "" : ` ws-btn--${variant}`}${size === "small" ? " ws-btn--small" : ""} ${className}`.trim();
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} className={cls} {...rest}>{children}</button>;
}

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`ws-badge${tone === "neutral" ? "" : ` ws-badge--${tone}`}`}>{children}</span>;
}

export function Notice({
  tone = "neutral", title, children, live,
}: { tone?: Tone; title?: string; children: React.ReactNode; live?: "polite" | "assertive" }) {
  return (
    <div className={`ws-notice${tone === "neutral" ? "" : ` ws-notice--${tone}`}`} role={live === "assertive" ? "alert" : live ? "status" : undefined}>
      {title && <p className="ws-h3" style={{ marginBottom: "0.2rem" }}>{title}</p>}
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="ws-card ws-card--quiet" style={{ textAlign: "center", padding: "1.6rem 1.1rem" }}>
      <p className="ws-h2">{title}</p>
      {children && <div className="ws-muted" style={{ marginTop: "0.4rem" }}>{children}</div>}
      {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="ws-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="ws-h1">{title}</h1>
        {description && <p className="ws-muted ws-small" style={{ marginTop: "0.25rem" }}>{description}</p>}
      </div>
      {actions && <div className="ws-row">{actions}</div>}
    </header>
  );
}
