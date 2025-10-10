import { useEffect, useState, RefObject } from 'react';
import * as L from 'leaflet';

interface UseMapOptions {
  center: L.LatLngExpression;
  zoom: number;
}

export const useMap = (
  mapContainerRef: RefObject<HTMLDivElement | null>,
  options: UseMapOptions
) => {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      console.log('Map container ref is not available yet.');
      return;
    }

    console.log('Initializing map...');
    const mapInstance = L.map(mapContainerRef.current, {
      center: options.center,
      zoom: options.zoom,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      console.log('Cleaning up map instance.');
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(() => {
      console.log('Forcing map to re-check its size (invalidateSize).');
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [map]);

  return map;
};