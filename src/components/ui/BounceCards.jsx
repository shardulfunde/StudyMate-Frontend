import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

export default function BounceCards({
  className = '',
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)'
  ],
  enableHover = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bounce-card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [animationDelay, animationStagger, easeType]);

  const getNoRotationTransform = (transformStr) => {
    if (/rotate\([\s\S]*?\)/.test(transformStr)) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    }

    return transformStr === 'none' ? 'rotate(0deg)' : `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const match = baseTransform.match(/translate\(([-0-9.]+)px\)/);

    if (match) {
      const currentX = parseFloat(match[1]);
      return baseTransform.replace(/translate\(([-0-9.]+)px\)/, `translate(${currentX + offsetX}px)`);
    }

    return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx) => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      const baseTransform = transformStyles[i] || 'none';

      gsap.killTweensOf(target);

      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
        return;
      }

      gsap.to(target, {
        transform: getPushedTransform(baseTransform, i < hoveredIdx ? -120 : 120),
        duration: 0.4,
        ease: 'back.out(1.4)',
        delay: Math.abs(hoveredIdx - i) * 0.04,
        overwrite: 'auto'
      });
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: transformStyles[i] || 'none',
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
    });
  };

  return (
    <div
      ref={containerRef}
      className={`bounce-cards-container ${className}`.trim()}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
    >
      {images.map((src, idx) => (
        <div
          key={src}
          className={`bounce-card bounce-card-${idx}`}
          style={{ transform: transformStyles[idx] ?? 'none' }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
        >
          <img className="bounce-card-image" src={src} alt={`StudyMate preview ${idx + 1}`} />
        </div>
      ))}
    </div>
  );
}
