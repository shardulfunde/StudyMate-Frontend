import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './TextPressure.css';

const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  const safeMaxDist = Math.max(maxDist, 1);
  const val = maxVal - Math.abs((maxVal * distance) / safeMaxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function TextPressure({
  text = 'StudyMate',
  fontFamily = 'Compressa VF',
  fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#0f172a',
  strokeColor = '#fb3a5d',
  className = '',
  minFontSize = 24
}) {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      cursorRef.current.x = event.clientX;
      cursorRef.current.y = event.clientY;
    };
    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      cursorRef.current.x = touch.clientX;
      cursorRef.current.y = touch.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width: rectWidth, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + rectWidth / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    const nextFontSize = Math.max(containerW / Math.max(chars.length / 2, 1), minFontSize);

    setFontSize(nextFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId;

    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          };
          const distance = dist(mouseRef.current, charCenter);
          const wdth = width ? Math.floor(getAttr(distance, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(distance, maxDist, 100, 900)) : 700;
          const italVal = italic ? getAttr(distance, maxDist, 0, 1).toFixed(2) : 0;
          const alphaVal = alpha ? getAttr(distance, maxDist, 0, 1).toFixed(2) : 1;
          const nextSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;

          if (span.style.fontVariationSettings !== nextSettings) {
            span.style.fontVariationSettings = nextSettings;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [alpha, italic, weight, width]);

  const styleElement = useMemo(() => (
    <style>{`
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}');
        font-style: normal;
      }

      .text-pressure-flex {
        display: flex;
        justify-content: space-between;
      }

      .text-pressure-stroke span {
        position: relative;
        color: ${textColor};
      }

      .text-pressure-stroke span::after {
        content: attr(data-char);
        position: absolute;
        left: 0;
        top: 0;
        color: transparent;
        z-index: -1;
        -webkit-text-stroke-width: 3px;
        -webkit-text-stroke-color: ${strokeColor};
      }
    `}</style>
  ), [fontFamily, fontUrl, strokeColor, textColor]);

  const dynamicClassName = [
    className,
    flex ? 'text-pressure-flex' : '',
    stroke ? 'text-pressure-stroke' : ''
  ].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className="text-pressure-container">
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${dynamicClassName}`.trim()}
        style={{
          color: textColor,
          fontFamily,
          fontSize,
          fontWeight: 100,
          lineHeight,
          margin: 0,
          textAlign: 'center',
          textTransform: 'uppercase',
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          width: '100%'
        }}
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{ color: stroke ? undefined : textColor, display: 'inline-block' }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}
