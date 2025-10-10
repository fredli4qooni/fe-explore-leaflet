import { useRef, useMemo, useState, useEffect } from 'react';
import { Icon } from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { useMap } from '../../hooks/useMap';
import { usePixiOverlay } from '../../hooks/usePixiOverlay';
import { usePerformanceStats } from '../../hooks/usePerformanceStats';
import { generateMockTrack, Coordinate } from '../../utils/trackGenerator';
import PerformanceControl from '../performance-control/PerformanceControl';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function generateInitialTracks(count: number) {
  console.log(`Generating ${count} initial mock tracks...`);
  const tracks = [];
  const startLat = -6.2;
  const startLng = 106.8;

  for (let i = 0; i < count; i++) {
    const randomStart: Coordinate = [
      startLat + (Math.random() - 0.5) * 0.1,
      startLng + (Math.random() - 0.5) * 0.1,
    ];
    tracks.push(generateMockTrack(`track-${i}`, randomStart, 2));
  }
  return tracks;
}

const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [trackCount, setTrackCount] = useState(10);

  const mapOptions = useMemo(
    () => ({
      center: [-6.2088, 106.8456] as LatLngExpression,
      zoom: 13,
    }),
    []
  );

  const [tracks, setTracks] = useState(() => generateInitialTracks(trackCount));

  useEffect(() => {
    setTracks(generateInitialTracks(trackCount));
  }, [trackCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTracks(currentTracks => {
        return currentTracks.map(track => {
          const lastCoord = track.path[track.path.length - 1];
          const variance = 0.0005; 
          const newLat = lastCoord[0] + (Math.random() - 0.5) * variance;
          const newLng = lastCoord[1] + (Math.random() - 0.5) * variance;
          
          const newPath = [...track.path, [newLat, newLng] as Coordinate];
          
          if (newPath.length > 100) {
            newPath.shift();
          }

          return { ...track, path: newPath };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stats = usePerformanceStats();
  const map = useMap(mapContainerRef, mapOptions);
  usePixiOverlay(map, tracks, stats);

  return (
    <>
      <PerformanceControl
        currentTrackCount={trackCount}
        onTrackCountChange={setTrackCount}
      />
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </>
  );
};

export default MapView;