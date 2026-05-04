interface InfoBannerProps {
  title: string;
  children: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'error';
}

export default function InfoBanner({ title, children, tone = 'neutral' }: InfoBannerProps) {
  return (
    <div className={`info-banner info-banner--${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
