import React from 'react';

export function BackgroundPlus({
  plusSize = 60,
  plusColor = 'rgba(37, 99, 235, 0.08)',
  backgroundColor = 'transparent',
  fade = true,
  className = '',
  style = {},
  ...props
}) {
  const encodedColor = encodeURIComponent(plusColor);

  const maskStyle = fade
    ? {
        maskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
      }
    : {};

  const bgStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    minHeight: '100%',
    pointerEvents: 'none',
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${plusSize}' height='${plusSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodedColor}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    ...maskStyle,
    ...style,
  };

  return (
    <div
      className={`background-plus ${className}`.trim()}
      style={bgStyle}
      aria-hidden="true"
      {...props}
    />
  );
}

export default BackgroundPlus;
