/**
 * @file UI component for controlling performance tests and displaying results.
 */
import React from 'react';
import { PerformanceResult } from '../../hooks/usePerformanceRecorder';

const TRACK_COUNTS = [10, 50, 100, 500, 1000, 5000, 10000];

interface PerformanceControlProps {
  currentTrackCount: number;
  onTrackCountChange: (count: number) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  results: PerformanceResult | null;
  clearResults: () => void;
}

const PerformanceControl: React.FC<PerformanceControlProps> = ({
  onTrackCountChange,
  isRecording,
  startRecording,
  stopRecording,
  results,
  clearResults,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000,
        fontFamily: 'sans-serif',
        fontSize: '14px',
        minWidth: '120px',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 4px 0', padding: 0 }}>Track Count</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TRACK_COUNTS.map(count => (
            <button key={count} onClick={() => onTrackCountChange(count)} disabled={isRecording} /* Disable while recording */>
              {count.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '4px 0' }} />

      <div>
        <h3 style={{ margin: '0 0 4px 0', padding: 0 }}>Recorder</h3>
        <button onClick={isRecording ? stopRecording : startRecording} style={{ width: '100%', backgroundColor: isRecording ? '#e74c3c' : '#2ecc71', color: 'white' }}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: '8px', backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 4px 0', padding: 0 }}>Test Results</h4>
          <p style={{ margin: 0 }}>Duration: <strong>{results.duration.toFixed(2)}s</strong></p>
          <p style={{ margin: 0 }}>Avg FPS: <strong>{results.avgFps.toFixed(2)}</strong></p>
          <p style={{ margin: 0 }}>Avg Memory: <strong>{results.avgMemory.toFixed(2)} MB</strong></p>
          <button onClick={clearResults} style={{ width: '100%', marginTop: '8px' }}>Clear</button>
        </div>
      )}
    </div>
  );
};

const buttonStyles = `
  button {
    padding: 4px 8px;
    border: 1px solid #ccc;
    cursor: pointer;
    background-color: #fff;
    color: #000;
    border-radius: 3px;
    transition: background-color 0.2s;
  }
  button:hover {
    background-color: #f0f0f0;
  }
  button:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
  button[onClick*="onTrackCountChange"]:disabled {
    /* Special style for disabled track count buttons */
  }
  button[onClick*="onTrackCountChange"]:not(:disabled)[style*="currentTrackCount"] {
    background-color: #3388ff;
    color: white;
  }
`;

// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.innerText = buttonStyles;
document.head.appendChild(styleSheet);

export default PerformanceControl;