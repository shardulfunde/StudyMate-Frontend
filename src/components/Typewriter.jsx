import { useEffect, useState } from 'react';
import './Typewriter.css';

export default function Typewriter({ phrases = [], suffix = '', speed = 80, pause = 1000 }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkId = setInterval(() => setBlink((v) => !v), 500);
    return () => clearInterval(blinkId);
  }, []);

  useEffect(() => {
    if (!phrases.length) return undefined;

    if (subIndex === phrases[index].length + 1 && !deleting) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
      return undefined;
    }

    const timeout = setTimeout(() => {
      setSubIndex((s) => s + (deleting ? -1 : 1));
    }, deleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, phrases, speed, pause]);

  return (
    <span className="typewriter">
      <span className="typewriter-text">{phrases[index].slice(0, subIndex)}</span>
      <span className={`typewriter-cursor ${blink ? 'blink' : ''}`}>|</span>
      <span className="typewriter-suffix">{suffix}</span>
    </span>
  );
}
