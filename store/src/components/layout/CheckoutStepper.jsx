import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export function CheckoutStepper({ step = 1 }) {
  // step 1: cart, 2: alamat, 3: review
  const circle = (active, completed) => {
    if (completed) return 'bg-[#111] text-white';
    if (active) return 'bg-[#111] text-white';
    return 'bg-[#f0f0f0] text-[#bbb]';
  };
  const labelClass = (active, completed) => (active || completed ? 'text-[#111]' : 'text-[#888]');
  const lineClass = (completed) => (completed ? 'bg-[#111]' : 'bg-[#e0e0e0]');

  return (
    <div className="flex items-center justify-center py-6">
      <Link to="/cart" className="flex flex-col items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-200 hover:opacity-70">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans transition-all duration-200 ${step > 1 ? circle(false, true) : circle(step===1, false)}`}>
          {step > 1 ? (
            <Check size={14} strokeWidth={2.5} />
          ) : '1'}
        </div>
        <span className={`font-sans text-[10px] font-medium tracking-[0.08em] uppercase ${labelClass(step===1, step>1)}`}>Keranjang</span>
      </Link>

      <div className={`w-[60px] h-px mx-2 mb-[26px] transition-colors duration-200 ${lineClass(step>1)}`} />

      <div className="flex flex-col items-center gap-[6px]">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans transition-all duration-200 ${step===2 ? circle(true,false) : step>2 ? circle(false,true) : circle(false,false)}`}>
          {step>2 ? <Check size={14} strokeWidth={2.5} /> : '2'}
        </div>
        <span className={`font-sans text-[10px] font-medium tracking-[0.08em] uppercase ${labelClass(step===2, step>2)}`}>Alamat</span>
      </div>

      <div className={`w-[60px] h-px mx-2 mb-[26px] transition-colors duration-200 ${lineClass(step>2)}`} />

      <div className="flex flex-col items-center gap-[6px]">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans transition-all duration-200 ${step===3 ? circle(true,false) : circle(false,false)}`}>3</div>
        <span className={`font-sans text-[10px] font-medium tracking-[0.08em] uppercase ${labelClass(step===3,false)}`}>Review</span>
      </div>
    </div>
  );
}
