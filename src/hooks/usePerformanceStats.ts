import { useEffect, useState } from 'react';
import Stats from 'stats.js';

export const usePerformanceStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    console.log("Creating new Stats instance");
    const s = new Stats();
    s.showPanel(0); // 0: fps
    document.body.appendChild(s.dom);
    s.dom.style.left = '8px';
    s.dom.style.top = '8px';

    setStats(s);

    return () => {
      console.log('Removing stats panel and instance');
      if (s.dom.parentElement) {
        document.body.removeChild(s.dom);
      }
    };
  }, []);

  return stats;
};