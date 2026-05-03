import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './NavHeader.css';

function NavHeader({ items = [], onItemClick, className = '' }) {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <div className={`nav-header-wrap ${className}`.trim()}>
      <ul
        className="nav-header"
        onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      >
        {items.map((item, i) => (
          <NavTab
            key={item.label || i}
            setPosition={setPosition}
            onClick={() => onItemClick?.(item)}
          >
            {item.href?.startsWith('#') ? (
              <a href={item.href} className="nav-header-link">{item.label}</a>
            ) : item.href?.startsWith('http') ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="nav-header-link">{item.label}</a>
            ) : (
              <span className="nav-header-link">{item.label}</span>
            )}
          </NavTab>
        ))}
        <NavCursor position={position} />
      </ul>
    </div>
  );
}

function NavTab({ children, setPosition, onClick }) {
  const ref = useRef(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      onClick={onClick}
      className="nav-header-tab"
    >
      {children}
    </li>
  );
}

function NavCursor({ position }) {
  return (
    <motion.li
      animate={position}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="nav-header-cursor"
    />
  );
}

export default NavHeader;
