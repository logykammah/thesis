import wordmark from '../assets/logo-clarity-wordmark.png';

/**
 * Full wordmark asset — centered for symmetric layout.
 * @param {'horizontal'|'mark'} variant horizontal = nav / wide header; mark = portal icon strip
 * @param {'default'|'compact'} density horizontal only — compact for sidebars / tight bars
 */
export function BrandLogo({ variant = 'mark', className = '', density = 'default' }) {
  const compact = density === 'compact';
  const alt = 'Clarity Dental Clinic';

  const horizontalCls = [
    'brand-logo-lockup',
    'brand-logo-lockup--wordmark',
    compact ? 'brand-logo-lockup--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'horizontal') {
    return (
      <div className={horizontalCls.trim()}>
        <img src={wordmark} alt={alt} className="brand-logo-wordmark-img" />
      </div>
    );
  }

  const markCls = ['brand-logo-mark-wrap', 'brand-logo-mark-wrap--wordmark', className].filter(Boolean).join(' ');

  return (
    <div className={markCls.trim()}>
      <div className="brand-logo-mark-inner brand-logo-mark-inner--wordmark">
        <img src={wordmark} alt={alt} className="brand-logo-wordmark-img brand-logo-wordmark-img--mark" />
      </div>
    </div>
  );
}
