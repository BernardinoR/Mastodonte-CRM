export function MastodonteLogo() {
  return (
    <svg
      width="200"
      height="50"
      viewBox="0 0 280 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-fadeInDown"
    >
      <rect x="0" y="25" width="10" height="25" rx="2" fill="currentColor" />
      <rect x="15" y="15" width="10" height="35" rx="2" fill="currentColor" />
      <path
        d="M30 15H40V35C40 45 50 45 50 35"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <text
        x="70"
        y="45"
        fontWeight="900"
        fontSize="32"
        letterSpacing="0"
        fill="currentColor"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Mastodonte.
      </text>
    </svg>
  );
}
