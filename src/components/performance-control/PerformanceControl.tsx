import React from 'react';

const TRACK_COUNTS = [10, 50, 100, 500, 1000, 5000, 10000];

interface PerformanceControlProps {
  currentTrackCount: number;
  onTrackCountChange: (count: number) => void;
}

const PerformanceControl: React.FC<PerformanceControlProps> = ({
  currentTrackCount,
  onTrackCountChange,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '8px',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: '0 0 4px 0', padding: 0, fontSize: '14px' }}>
        Track Count
      </h3>
      {TRACK_COUNTS.map(count => (
        <button
          key={count}
          onClick={() => onTrackCountChange(count)}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            cursor: 'pointer',
            backgroundColor: currentTrackCount === count ? '#3388ff' : '#fff',
            color: currentTrackCount === count ? '#fff' : '#000',
          }}
        >
          {count.toLocaleString()}
        </button>
      ))}
    </div>
  );
};

export default PerformanceControl;