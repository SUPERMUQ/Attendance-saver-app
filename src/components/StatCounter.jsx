import React, { useState, useEffect, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function StatCounter({ end, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal();
  const started = useRef(false);

  useEffect(() => {
    if (visible && !started.current) {
      started.current = true;
      const steps = 50;
      const inc = end / steps;
      let cur = 0;

      const id = setInterval(() => {
        cur += inc;
        if (cur >= end) {
          setCount(end);
          clearInterval(id);
        } else {
          setCount(Number.isInteger(end) ? Math.floor(cur) : parseFloat(cur.toFixed(1)));
        }
      }, duration / steps);

      return () => clearInterval(id);
    }
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}
