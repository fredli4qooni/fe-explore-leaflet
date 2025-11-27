/**
 * @file Utility functions for generating mock track data.
 */

/**
 * A tuple representing a [latitude, longitude] coordinate.
 */
export type Coordinate = [number, number];

/**
 * Defines the structure for a single track object.
 * @property {string} id - A unique identifier for the track.
 * @property {string} label - The display label for the track.
 * @property {Coordinate[]} path - An array of coordinates representing the track's path.
 */
export interface Track {
  id: string;
  label: string;
  path: Coordinate[];
}

/**
 * Generates a single mock track with a randomized path.
 * @param {string} id - A unique identifier for the track.
 * @param {Coordinate} [startCoord=[-6.2, 106.8]] - The starting coordinate. Defaults to a location in Jakarta.
 * @param {number} [numPoints=50] - The number of points in the track's path. Defaults to 50.
 * @param {number} [variance=0.001] - The amount of random deviation for each new point. Defaults to 0.001.
 * @returns {Track} The generated Track object.
 */
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