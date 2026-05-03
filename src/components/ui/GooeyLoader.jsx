import React from 'react';
import './GooeyLoader.css';

export default function GooeyLoader({
  primaryColor = '#2563eb',
  secondaryColor = '#93c5fd',
  borderColor = '#e2e8f0',
  message = '',
  className = ''
}) {
  const style = {
    '--gooey-primary': primaryColor,
    '--gooey-secondary': secondaryColor,
    '--gooey-border': borderColor,
  };

  return (
    <div className={`gooey-loader-wrap ${className}`.trim()} style={style} role="status" aria-label="Loading">
      <svg className="gooey-svg-filter" aria-hidden="true">
        <defs>
          <filter id="gooey-loader-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 48 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div className="gooey-loader" />
      {message && <p className="gooey-loader-msg">{message}</p>}
    </div>
  );
}
