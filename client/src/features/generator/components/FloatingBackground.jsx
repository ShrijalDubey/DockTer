import React, { useMemo } from 'react';
import styles from '../generator.module.css';

const EXTENSIONS = [
  '.jsx', '.tsx', '.py', '.env', '.json', '.yml', 
  '.css', '.js', '.sh', '.md', '.go', '.rs', '.cpp', '.java'
];

const FloatingBackground = () => {
  const items = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const text = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 15 + Math.random() * 25; // 15s to 40s
      const delay = Math.random() * -30; // Start at random times
      const fontSize = 0.8 + Math.random() * 1.2; // 0.8rem to 2rem
      
      return { id: i, text, left, top, duration, delay, fontSize };
    });
  }, []);

  return (
    <div className={styles.floatingBg}>
      {items.map(item => (
        <div 
          key={item.id} 
          className={styles.floatingItem}
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.fontSize}rem`
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingBackground;
