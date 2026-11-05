export function BrandMark({size = 32}: {size?: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="10" fill="currentColor" />
      <path
        d="M16 24.2c0 0-6.4-2.6-6.4-9.2 0-4.2 3.2-6 6.4-2.6 3.2-3.4 6.4-1.6 6.4 2.6 0 6.6-6.4 9.2-6.4 9.2Z"
        fill="#fff"
        fillOpacity="0.2"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 24.2V13.4M16 16.6c-1.8-.8-3.2-2.2-3.8-4M16 17.8c1.7-.6 3.2-2 4-3.6"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
