export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#3B82F6" />

      {/* Letter F - Main element */}
      <path
        d="M30 25 H65 V35 H42 V42 H60 V52 H42 V75 H30 V25 Z"
        fill="white"
        stroke="white"
        strokeWidth="1"
      />

      {/* Rising Chart Line - representing growth/finance */}
      <path
        d="M60 65 L65 60 L70 62 L75 55"
        stroke="#60A5FA"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Chart Point Dots */}
      <circle cx="60" cy="65" r="2.5" fill="#60A5FA" />
      <circle cx="65" cy="60" r="2.5" fill="#60A5FA" />
      <circle cx="70" cy="62" r="2.5" fill="#60A5FA" />
      <circle cx="75" cy="55" r="2.5" fill="#60A5FA" />

      {/* Digital Element - pixel/circuit pattern */}
      <rect x="68" y="70" width="3" height="3" fill="#93C5FD" opacity="0.8" />
      <rect x="73" y="70" width="3" height="3" fill="#93C5FD" opacity="0.8" />
      <rect x="68" y="75" width="3" height="3" fill="#93C5FD" opacity="0.8" />
      <rect x="73" y="75" width="3" height="3" fill="#93C5FD" opacity="0.8" />
    </svg>
  )
}
