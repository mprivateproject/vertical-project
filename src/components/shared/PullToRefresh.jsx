import React, { useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    const el = containerRef.current;
    if (el && el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      setPulling(true);
      setPullY(Math.min(dy * 0.45, THRESHOLD));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullY(0);
    startY.current = null;
  };

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none overflow-hidden"
        style={{ height: pullY > 0 ? pullY : refreshing ? THRESHOLD : 0, transition: pulling ? 'none' : 'height 0.3s ease' }}
      >
        <motion.div
          animate={{ rotate: refreshing ? 360 : progress * 180 }}
          transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: 'linear' } : { duration: 0 }}
        >
          <RefreshCw
            className="w-5 h-5 text-muted-foreground"
            style={{ opacity: Math.max(progress, refreshing ? 1 : 0) }}
          />
        </motion.div>
      </div>

      {/* Content shifted down when pulling */}
      <div style={{ transform: `translateY(${pullY}px)`, transition: pulling ? 'none' : 'transform 0.3s ease' }}>
        {children}
      </div>
    </div>
  );
}