/**
 * @file Manages the loading of PIXI assets.
 * This approach pre-loads assets outside the React component lifecycle
 * to avoid issues with React StrictMode and re-renders.
 */

import * as PIXI from 'pixi.js';
import arrowIconUrl from '../assets/icons/arrow.svg';

const loader = PIXI.Loader.shared;

/**
 * A promise that resolves with the loaded texture, ensuring it's loaded only once.
 * @type {Promise<PIXI.Texture> | null}
 */
let texturePromise: Promise<PIXI.Texture> | null = null;

/**
 * Loads the arrow icon texture using PIXI.Loader.
 * Caches the promise to prevent multiple loads across the application.
 * @returns {Promise<PIXI.Texture>} A promise that resolves with the arrow icon's PIXI.Texture.
 */
export const getArrowTexture = (): Promise<PIXI.Texture> => {
  if (texturePromise) {
    return texturePromise;
  }

  texturePromise = new Promise((resolve, reject) => {
    if (loader.resources['arrow']?.texture) {
      console.log("Texture found in cache.");
      resolve(loader.resources['arrow'].texture);
      return;
    }

    loader.add('arrow', arrowIconUrl);
    
    loader.load((_loader, resources) => {
      const arrowResource = resources['arrow'];
      if (arrowResource?.texture) {
        console.log("Texture loaded and ready.");
        resolve(arrowResource.texture);
      } else {
        reject(new Error("Failed to load arrow texture."));
      }
    });

    loader.onError.add((error) => reject(error));
  });

  return texturePromise;
};