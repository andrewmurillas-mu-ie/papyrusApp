export default function InfoBanner({ title, children, tone = 'neutral' }) {
  return (
    <div className={`info-banner info-banner--${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}