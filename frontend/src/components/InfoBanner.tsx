import React, {ReactElement} from 'react';

interface InfoBannerProps {
  title: string;
  children: React.ReactNode;
  tone?: 'neutral' | 'warning' | 'error' | 'success';
}

export default function InfoBanner({ title, children, tone = 'neutral' }: InfoBannerProps): ReactElement {
  return (
    <div className={`info-banner info-banner--${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}