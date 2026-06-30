import type React from 'react';

export function getPositionStyles(
  position: string,
): React.CSSProperties {
  switch (position) {
    case 'top-left':
      return { top: 24, left: 24 };
    case 'top-center':
      return { top: 24, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-left':
      return { bottom: 24, left: 24 };
    case 'bottom-right':
      return { bottom: 24, right: 24 };
    case 'bottom-center':
      return { bottom: 24, left: '50%', transform: 'translateX(-50%)' };
    default:
      return { top: 24, right: 24 };
  }
}
