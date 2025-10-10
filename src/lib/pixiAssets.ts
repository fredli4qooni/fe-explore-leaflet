import * as PIXI from 'pixi.js';
import arrowIconUrl from '../assets/icons/arrow.svg';

// Buat satu instance loader global
const loader = PIXI.Loader.shared;

// Promise yang akan resolve saat tekstur siap
let texturePromise: Promise<PIXI.Texture> | null = null;

export const getArrowTexture = (): Promise<PIXI.Texture> => {
  // Jika promise sudah ada, kembalikan promise yang sama
  if (texturePromise) {
    return texturePromise;
  }

  // Jika belum, buat promise baru untuk loading
  texturePromise = new Promise((resolve, reject) => {
    // Cek cache dulu
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