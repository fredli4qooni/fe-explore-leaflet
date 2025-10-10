import { useRef, useMemo, useState } from 'react';
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

  const mockTracks = useMemo(() => {
    console.log(`Generating ${trackCount} mock tracks...`);
    const tracks = [];
    const startLat = -6.2;
    const startLng = 106.8;

    for (let i = 0; i < trackCount; i++) {
      const randomStart: Coordinate = [
        startLat + (Math.random() - 0.5) * 0.1,
        startLng + (Math.random() - 0.5) * 0.1,
      ];
      tracks.push(generateMockTrack(`track-${i}`, randomStart));
    }
    return tracks;
  }, [trackCount]);

  const stats = usePerformanceStats();
  const map = useMap(mapContainerRef, mapOptions);
  usePixiOverlay(map, mockTracks, stats);

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