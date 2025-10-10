export type Coordinate = [number, number];

export interface Track {
  id: string;
  label: string;
  path: Coordinate[];
}

export const generateMockTrack = (
  id: string,
  startCoord: Coordinate = [-6.2, 106.8],
  numPoints: number = 50,
  variance: number = 0.001
): Track => {
  const path: Coordinate[] = [startCoord];
  let lastCoord: Coordinate = [...startCoord];

  for (let i = 1; i < numPoints; i++) {
    const newLat = lastCoord[0] + (Math.random() - 0.5) * variance;
    const newLng = lastCoord[1] + (Math.random() - 0.5) * variance;
    lastCoord = [newLat, newLng];
    path.push(lastCoord);
  }

  const label = `Track ${id.split('-')[1]}`;

  return { id, label, path };
};