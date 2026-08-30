import { siInstagram, siTiktok, siWhatsapp } from 'simple-icons';

/**
 * Generic brand icon renderer for simple-icons.
 * Uses currentColor so Tailwind text-* classes control color.
 */
function BrandIcon({ icon, size = 16, ...props }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d={icon.path} />
    </svg>
  );
}

export function InstagramIcon({ size = 16, ...props }) {
  return <BrandIcon icon={siInstagram} size={size} {...props} />;
}

export function TiktokIcon({ size = 16, ...props }) {
  return <BrandIcon icon={siTiktok} size={size} {...props} />;
}

export function WhatsappIcon({ size = 16, ...props }) {
  return <BrandIcon icon={siWhatsapp} size={size} {...props} />;
}

// For cases where WhatsApp is shown as filled white on green background, pass fill explicitly
export { BrandIcon };
