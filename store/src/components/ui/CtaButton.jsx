import { Link } from 'react-router-dom';

/**
 * CtaButton — single reusable CTA button
 * Full dynamic control over visual tokens: background, color, outline, fontSize, fontWeight
 * Defaults preserve hero dark-bg style (white / transparent-white)
 */
export function CtaButton({
  children,
  to,
  href = '#',
  // visual tokens — pass Tailwind class strings
  background = 'bg-white',
  color = 'text-[#111]',
  outline = 'border border-transparent',
  fontSize = 'text-[10px]',
  fontWeight = 'font-medium',
  tracking = 'tracking-[0.15em]',
  rounded = 'rounded',
  hover = '',
  className = '',
  ...props
}) {
  const base =
    'inline-block px-6 py-2.5 font-sans uppercase no-underline transition-colors duration-200';
  const classes = `${base} ${background} ${color} ${outline} ${fontSize} ${fontWeight} ${tracking} ${rounded} ${hover} ${className}`.trim().replace(/\s+/g, ' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}

/**
 * CtaButtonGroup — two CTAs side-by-side
 * Replaces previous HeroActions; now fully dynamic per-section.
 */
export function CtaButtonGroup({
  primaryTo = '/products',
  primaryLabel = 'Jelajahi Koleksi',
  secondaryHref = '#',
  secondaryLabel = 'Jadi Reseller',
  // primary tokens
  primaryBackground = 'bg-white',
  primaryColor = 'text-[#111]',
  primaryOutline = 'border border-transparent',
  primaryFontSize = 'text-[10px]',
  primaryFontWeight = 'font-medium',
  primaryHover = 'hover:bg-white/90',
  // secondary tokens
  secondaryBackground = 'bg-transparent',
  secondaryColor = 'text-white',
  secondaryOutline = 'border border-white/60',
  secondaryFontSize = 'text-[10px]',
  secondaryFontWeight = 'font-medium',
  secondaryHover = 'hover:bg-white/10',
  className = '',
  primaryProps = {},
  secondaryProps = {},
}) {
  return (
    <div className={`flex gap-3 flex-wrap ${className}`}>
      <CtaButton
        to={primaryTo}
        background={primaryBackground}
        color={primaryColor}
        outline={primaryOutline}
        fontSize={primaryFontSize}
        fontWeight={primaryFontWeight}
        hover={primaryHover}
        {...primaryProps}
      >
        {primaryLabel}
      </CtaButton>
      <CtaButton
        href={secondaryHref}
        background={secondaryBackground}
        color={secondaryColor}
        outline={secondaryOutline}
        fontSize={secondaryFontSize}
        fontWeight={secondaryFontWeight}
        hover={secondaryHover}
        {...secondaryProps}
      >
        {secondaryLabel}
      </CtaButton>
    </div>
  );
}

// Backwards-compat alias — previous HeroActions now maps to CtaButtonGroup with hero defaults
export const HeroActions = CtaButtonGroup;
export const HeroPrimaryButton = (props) => <CtaButton {...props} />;
export const HeroSecondaryButton = (props) => <CtaButton background="bg-transparent" color="text-white" outline="border border-white/60" hover="hover:bg-white/10" {...props} />;
