import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './Shuffle.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Simplified Shuffle text animation — no GSAP SplitText dependency.
 * Splits text into characters via DOM, then animates each with a strip-slide effect.
 */
const Shuffle = ({
  text = '',
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  ease = 'power3.out',
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = 'evenodd',
  stagger = 0.03,
  scrambleCharset = '',
  colorFrom,
  colorTo,
  triggerOnce = true,
  triggerOnHover = true,
  respectReducedMotion = true
}) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef(null);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || '');
    const mv = mm ? parseFloat(mm[1]) : 0;
    const mu = mm ? (mm[2] || 'px') : 'px';
    const sign = mv === 0 ? '' : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
    return `top ${startPct}%${sign}`;
  }, [threshold, rootMargin]);

  const removeHover = useCallback(() => {
    if (hoverHandlerRef.current && ref.current) {
      ref.current.removeEventListener('mouseenter', hoverHandlerRef.current);
      hoverHandlerRef.current = null;
    }
  }, []);

  useGSAP(() => {
    if (!ref.current || !text) return;
    if (respectReducedMotion && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setReady(true);
      onShuffleComplete?.();
      return;
    }

    const el = ref.current;
    let tlRef = null;

    const splitIntoChars = () => {
      const chars = [];
      el.innerHTML = '';
      for (const ch of text) {
        if (ch === ' ') {
          const space = document.createElement('span');
          space.innerHTML = '&nbsp;';
          space.style.display = 'inline-block';
          el.appendChild(space);
          continue;
        }
        const span = document.createElement('span');
        span.textContent = ch;
        span.className = 'shuffle-char';
        span.style.display = 'inline-block';
        span.style.textAlign = 'center';
        el.appendChild(span);
        chars.push(span);
      }
      return chars;
    };

    const build = () => {
      if (tlRef) { tlRef.kill(); tlRef = null; }
      const chars = splitIntoChars();
      const rolls = Math.max(1, Math.floor(shuffleTimes));
      const wrappers = [];
      const rand = (set) => set.charAt(Math.floor(Math.random() * set.length)) || '';

      chars.forEach((ch) => {
        const parent = ch.parentElement;
        if (!parent) return;
        const w = ch.getBoundingClientRect().width;
        const h = ch.getBoundingClientRect().height;
        if (!w) return;

        const isVert = shuffleDirection === 'up' || shuffleDirection === 'down';

        const wrap = document.createElement('span');
        Object.assign(wrap.style, {
          display: 'inline-block', overflow: 'hidden',
          width: w + 'px', height: isVert ? h + 'px' : 'auto',
          verticalAlign: 'bottom'
        });

        const inner = document.createElement('span');
        Object.assign(inner.style, {
          display: 'inline-block',
          whiteSpace: isVert ? 'normal' : 'nowrap',
          willChange: 'transform'
        });

        parent.insertBefore(wrap, ch);
        wrap.appendChild(inner);

        const firstCopy = ch.cloneNode(true);
        Object.assign(firstCopy.style, {
          display: isVert ? 'block' : 'inline-block', width: w + 'px', textAlign: 'center'
        });
        ch.setAttribute('data-orig', '1');
        Object.assign(ch.style, {
          display: isVert ? 'block' : 'inline-block', width: w + 'px', textAlign: 'center'
        });

        inner.appendChild(firstCopy);
        for (let k = 0; k < rolls; k++) {
          const c = ch.cloneNode(true);
          if (scrambleCharset) c.textContent = rand(scrambleCharset);
          Object.assign(c.style, {
            display: isVert ? 'block' : 'inline-block', width: w + 'px', textAlign: 'center'
          });
          inner.appendChild(c);
        }
        inner.appendChild(ch);

        const steps = rolls + 1;
        if (shuffleDirection === 'right' || shuffleDirection === 'down') {
          const fc = inner.firstElementChild;
          const real = inner.lastElementChild;
          if (real) inner.insertBefore(real, inner.firstChild);
          if (fc) inner.appendChild(fc);
        }

        let startX = 0, finalX = 0, startY = 0, finalY = 0;
        if (shuffleDirection === 'right') { startX = -steps * w; finalX = 0; }
        else if (shuffleDirection === 'left') { startX = 0; finalX = -steps * w; }
        else if (shuffleDirection === 'down') { startY = -steps * h; finalY = 0; }
        else if (shuffleDirection === 'up') { startY = 0; finalY = -steps * h; }

        if (!isVert) {
          gsap.set(inner, { x: startX, y: 0, force3D: true });
          inner.setAttribute('data-start-x', String(startX));
          inner.setAttribute('data-final-x', String(finalX));
        } else {
          gsap.set(inner, { x: 0, y: startY, force3D: true });
          inner.setAttribute('data-start-y', String(startY));
          inner.setAttribute('data-final-y', String(finalY));
        }

        if (colorFrom) inner.style.color = colorFrom;
        wrappers.push(wrap);
      });

      return wrappers;
    };

    const play = (wrappers) => {
      const strips = wrappers.map((w) => w.firstElementChild);
      if (!strips.length) return;
      playingRef.current = true;
      const isVert = shuffleDirection === 'up' || shuffleDirection === 'down';

      const tl = gsap.timeline({
        smoothChildTiming: true,
        onComplete: () => {
          playingRef.current = false;
          // Cleanup: show only final char
          wrappers.forEach((w) => {
            const strip = w.firstElementChild;
            if (!strip) return;
            const real = strip.querySelector('[data-orig="1"]');
            if (!real) return;
            strip.replaceChildren(real);
            strip.style.transform = 'none';
            strip.style.willChange = 'auto';
          });
          if (colorTo) gsap.set(strips, { color: colorTo });
          onShuffleComplete?.();
          armHover();
        }
      });

      const addTween = (targets, at) => {
        const vars = { duration, ease, force3D: true, stagger: animationMode === 'evenodd' ? stagger : 0 };
        if (isVert) vars.y = (i, t) => parseFloat(t.getAttribute('data-final-y') || '0');
        else vars.x = (i, t) => parseFloat(t.getAttribute('data-final-x') || '0');
        tl.to(targets, vars, at);
        if (colorFrom && colorTo) tl.to(targets, { color: colorTo, duration, ease }, at);
      };

      if (animationMode === 'evenodd') {
        const odd = strips.filter((_, i) => i % 2 === 1);
        const even = strips.filter((_, i) => i % 2 === 0);
        const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
        const evenStart = odd.length ? oddTotal * 0.7 : 0;
        if (odd.length) addTween(odd, 0);
        if (even.length) addTween(even, evenStart);
      } else {
        strips.forEach((strip) => {
          const vars = { duration, ease, force3D: true };
          if (isVert) vars.y = parseFloat(strip.getAttribute('data-final-y') || '0');
          else vars.x = parseFloat(strip.getAttribute('data-final-x') || '0');
          tl.to(strip, vars, Math.random() * 0.3);
        });
      }

      tlRef = tl;
    };

    const armHover = () => {
      if (!triggerOnHover || !ref.current) return;
      removeHover();
      const handler = () => {
        if (playingRef.current) return;
        const w = build();
        play(w);
      };
      hoverHandlerRef.current = handler;
      ref.current.addEventListener('mouseenter', handler);
    };

    const create = () => {
      const w = build();
      play(w);
      setReady(true);
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: scrollTriggerStart,
      once: triggerOnce,
      onEnter: create
    });

    return () => {
      st.kill();
      removeHover();
      if (tlRef) { tlRef.kill(); tlRef = null; }
      setReady(false);
    };
  }, {
    dependencies: [text, duration, ease, scrollTriggerStart, shuffleDirection, shuffleTimes,
      animationMode, stagger, scrambleCharset, colorFrom, colorTo, triggerOnce, triggerOnHover,
      respectReducedMotion, onShuffleComplete],
    scope: ref
  });

  const Tag = tag || 'p';
  return React.createElement(
    Tag,
    {
      ref,
      className: `shuffle-parent ${ready ? 'is-ready' : ''} ${className}`.trim(),
      style: { textAlign, ...style }
    },
    text
  );
};

export default Shuffle;
