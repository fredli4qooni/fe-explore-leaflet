/**
 * @file Custom hook to record and calculate performance metrics (FPS, Memory).
 */
import { useState, useEffect, useRef } from 'react';
import Stats from 'stats.js';
import * as PIXI from 'pixi.js';

/**
 * The structure for the final calculated performance results.
 */
export interface PerformanceResult {
  avgFps: number;
  avgMemory: number;
  duration: number; // in seconds
}

// Type guard to check for performance.memory API
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
  };
}

/**
 * A custom hook that provides functionality to record performance metrics.
 * @param {Stats | null} stats - The stats.js instance (used only as a trigger).
 * @returns An object containing recording state, control functions, and results.
 */
export const usePerformanceRecorder = (stats: Stats | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<PerformanceResult | null>(null);
  const recordedData = useRef<{ fps: number; mem: number }[]>([]);
  const startTime = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  /**
   * Effect to collect data on every frame while recording is active.
   */
  useEffect(() => {
    if (!isRecording || !stats) {
      return;
    }

    const ticker = PIXI.Ticker.shared;
    const recordFrame = () => {
      const now = performance.now();
      
      const delta = now - lastFrameTime.current;
      const fps = delta > 0 ? 1000 / delta : 60; 
      lastFrameTime.current = now;

      const performanceWithMemory = performance as PerformanceWithMemory;
      let mem = 0;
      if (performanceWithMemory.memory) {
        mem = performanceWithMemory.memory.usedJSHeapSize / 1024 / 1024;
      }
      
      recordedData.current.push({ fps, mem });
    };

    lastFrameTime.current = performance.now();
    ticker.add(recordFrame);

    return () => {
      ticker.remove(recordFrame);
    };
  }, [isRecording, stats]);

  /**
   * Starts the performance recording session.
   */
  const startRecording = () => {
    console.log('Performance recording started...');
    recordedData.current = [];
    setResults(null);
    startTime.current = performance.now();
    setIsRecording(true);
  };

  /**
   * Stops the recording session and calculates the results.
   */
  const stopRecording = () => {
    if (!isRecording) return;
    
    console.log('Performance recording stopped.');
    const endTime = performance.now();
    const duration = (endTime - startTime.current) / 1000;
    setIsRecording(false);

    const stableData = recordedData.current.slice(10);

    if (stableData.length === 0) {
      console.warn("Not enough data recorded.");
      setResults({ avgFps: 0, avgMemory: 0, duration });
      return;
    }

    const total = stableData.reduce(
      (acc, data) => {
        acc.fps += data.fps;
        acc.mem += data.mem;
        return acc;
      },
      { fps: 0, mem: 0 }
    );

    const avgFps = total.fps / stableData.length;
    const avgMemory = total.mem / stableData.length;

    setResults({ avgFps, avgMemory, duration });
  };

  const clearResults = () => {
    setResults(null);
  };

  return { isRecording, startRecording, stopRecording, results, clearResults };
};