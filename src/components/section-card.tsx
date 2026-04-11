type SectionCardProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <section className="card section-card">
      <div className="section-card-header">
        <div>
          <h3>{title}</h3>
          {description ? <p className="text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="section-card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
