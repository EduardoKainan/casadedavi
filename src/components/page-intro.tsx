type PageIntroProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageIntro({ title, description, actions }: PageIntroProps) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p className="text-muted">{description}</p>
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </div>
  );
}
