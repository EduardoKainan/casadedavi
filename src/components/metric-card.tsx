import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  tone: "primary" | "success" | "warning" | "danger";
};

export function MetricCard({ icon: Icon, label, value, description, tone }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className={cn("metric-icon-bg", `tone-${tone}`)}>
        <Icon size={24} className="metric-icon" />
      </div>
      <div className="metric-info">
        <p className="metric-label">{label}</p>
        <h3 className="metric-value">{value}</h3>
        <p className="metric-description">{description}</p>
      </div>
    </article>
  );
}
