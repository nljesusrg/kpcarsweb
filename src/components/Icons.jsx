export const CarIcon = ({ size = 64, opacity = 0.2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity }}>
    <path d="M5 17h1m12 0h1M7 11h10M5 11l1.5-5h11L19 11M5 11H3.6a1 1 0 0 0-1 .8L2 15h1.5A1.5 1.5 0 0 0 5 13.5V11Zm14 0h1.4a1 1 0 0 1 1 .8L22 15h-1.5a1.5 1.5 0 0 1-1.5-1.5V11ZM7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);

export const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const CloseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const LogoutIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* Íconos de las áreas, dibujados con el lenguaje del logo:
   formas macizas, cortes en diagonal, una curva redonda y puntitos. */
export const RentalsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M1.5 17.5 V12.6 L5 11.6 L9 6.5 H15.2 L19.6 11.4 L22.5 12.4 V17.5 H20.5 A3.1 3.1 0 0 0 14.3 17.5 H9.7 A3.1 3.1 0 0 0 3.5 17.5 Z M9.9 8.6 L7.6 11.5 H11.6 V8.6 Z M13.4 8.6 V11.5 H17.2 L14.5 8.6 Z M4.4 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M5.75 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z M15.2 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M16.55 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z" />
  </svg>
);

export const FletesIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M1.5 5.5 H13.8 V17.5 H8.9 A3.1 3.1 0 0 0 2.7 17.5 H1.5 Z M15.2 8.5 H19.2 L22.5 11.8 V17.5 H21.5 A3.1 3.1 0 0 0 15.3 17.5 H15.2 Z M17 10.4 V12.6 H20.6 L18.4 10.4 Z M3.6 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M4.95 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z M16.2 17.7 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0 Z M17.55 17.7 a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 Z" />
  </svg>
);

/* Gancho de remolque: recuerda a la "P" del logo */
export const AuxiliosIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <g transform="translate(-1.4 0.9) scale(0.92)">
      <mask id="kp-hook-mask">
        <rect x="-6" y="-6" width="40" height="40" fill="#fff" />
        <circle cx="13.2" cy="4.5" r="0.95" fill="#000" />
        <circle cx="4.94" cy="16.25" r="0.85" fill="#000" />
      </mask>
      <path mask="url(#kp-hook-mask)" stroke="currentColor" strokeWidth="3.4" strokeLinecap="butt" d="M13.2 2 V9.6 a5.6 5.6 0 1 1 -8.6 4.7" />
    </g>
  </svg>
);

export const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const DocumentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export const WrenchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const CoinIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const SmartphoneIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const UsersIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const PencilIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const AlertIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const PlusIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ChatIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#5fd38d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const ChevronIcon = ({ size = 20, dir = "right" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <polyline points={{ right: "9 18 15 12 9 6", left: "15 18 9 12 15 6", down: "6 9 12 15 18 9", up: "6 15 12 9 18 15" }[dir]} />
  </svg>
);
