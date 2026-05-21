import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Reveal({ children, delay = 0, direction = 'up' }) {
  const [ref, visible] = useScrollReveal();
  const t = { 
    up: 'translateY(26px)', 
    left: 'translateX(-26px)', 
    right: 'translateX(26px)' 
  };

  return (
    <div 
      ref={ref} 
      style={{ 
        opacity: visible ? 1 : 0, 
        transform: visible ? 'none' : t[direction], 
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms` 
      }}
    >
      {children}
    </div>
  );
}
