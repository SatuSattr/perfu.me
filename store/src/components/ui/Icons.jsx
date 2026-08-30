import { ShoppingCart, ArrowLeft, ArrowRight, ChevronDown, Star } from 'lucide-react';

export function IconCart(props) {
  return <ShoppingCart size={18} strokeWidth={1.5} {...props} />;
}
export function IconArrowLeft(props) {
  return <ArrowLeft size={16} strokeWidth={2} {...props} />;
}
export function IconArrowRight(props) {
  return <ArrowRight size={16} strokeWidth={2} {...props} />;
}
export function IconChevronDown(props) {
  return <ChevronDown size={14} strokeWidth={2} {...props} />;
}
export function IconStar({ filled, size = 14, ...props }) {
  return (
    <Star
      size={size}
      strokeWidth={2}
      fill="currentColor"
      className={filled ? 'text-amber-400 fill-amber-400' : 'text-[#ddd] fill-[#ddd]'}
      {...props}
    />
  );
}
