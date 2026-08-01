type Status = "live" | "beta" | "coming-soon" | "planned" | "demo";

const labels: Record<Status, string> = {
  live: "LIVE",
  beta: "BETA",
  "coming-soon": "COMING SOON",
  planned: "PLANNED",
  demo: "DEMO",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge status-badge--${status}`}>{labels[status]}</span>;
}
