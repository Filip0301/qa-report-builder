import React from 'react';

const sizes = {
  sm: 'w-8 h-8 rounded-lg',
  lg: 'w-14 h-14 rounded-2xl',
} as const;

/** Marca de la aplicación (barras de un gráfico sobre fondo índigo). */
export default function Logo({ size = 'sm' }: { size?: keyof typeof sizes }) {
  const icon = size === 'lg' ? 28 : 16;
  return (
    <div
      className={`${sizes[size]} bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0`}
      aria-hidden="true"
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="12" width="4" height="9" rx="1" fill="#a5b4fc" />
        <rect x="10" y="7" width="4" height="14" rx="1" fill="#e0e7ff" />
        <rect x="17" y="3" width="4" height="18" rx="1" fill="#c7d2fe" />
      </svg>
    </div>
  );
}
