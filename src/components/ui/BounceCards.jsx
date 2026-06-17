import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

export default function BounceCards({
  className = '',
  images = [],
  children,
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
  // When the container is hovered, cards animate to these transforms (spread apart)
  hoverTransformStyles = null,
  enableHover = true
}) {
  const containerRef = useRef(null);

  const items = children
    ? (Array.isArray(children) ? children : [children])
    : images;

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

  const spreadCards = () => {
    if (!enableHover || !containerRef.current || !hoverTransformStyles) return;

    const q = gsap.utils.selector(containerRef);

    items.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: hoverTransformStyles[i] || 'none',
        duration: 0.5,
        ease: 'back.out(1.7)',
        delay: i * 0.04,
        overwrite: 'auto'
      });
    });
  };

  const pushSiblings = (hoveredIdx) => {
    if (!enableHover || !containerRef.current || hoverTransformStyles) return;

    const q = gsap.utils.selector(containerRef);

    items.forEach((_, i) => {
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

  const resetCards = () => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    items.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: transformStyles[i] || 'none',
        duration: 0.5,
        ease: 'back.out(1.7)',
        overwrite: 'auto'
      });
    });
  };

  const renderCard = (content, idx, isChild) => (
    <div
      key={idx}
      className={`bounce-card bounce-card-${idx}`}
      style={{ transform: transformStyles[idx] ?? 'none' }}
      onMouseEnter={() => pushSiblings(idx)}
      onMouseLeave={resetCards}
    >
      {isChild ? content : <img className="bounce-card-image" src={content} alt={`Card ${idx + 1}`} />}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`bounce-cards-container ${className}`.trim()}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
      onMouseEnter={spreadCards}
      onMouseLeave={resetCards}
    >
      {children
        ? items.map((child, idx) => renderCard(child, idx, true))
        : images.map((src, idx) => renderCard(src, idx, false))
      }
    </div>
  );
}
