/** The Ziki mark, copied from components/ziki-mark.tsx in Ziki. */
export function ZikiMark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 32" fill="none" className={className} aria-hidden>
      <path d="M5 13h16L5 27.5h16" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 2.5 21 9h-9Z" fill="#38A3FF" stroke="#38A3FF" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
