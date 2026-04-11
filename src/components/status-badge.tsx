import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  tone: "primary" | "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}
