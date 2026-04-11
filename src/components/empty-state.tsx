import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="empty-panel">
      <div className="empty-panel-icon">
        <Icon size={28} />
      </div>
      <div>
        <h3>{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
}
