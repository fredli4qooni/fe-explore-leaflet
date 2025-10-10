/**
 * @file The core custom hook that manages the Leaflet.PixiOverlay.
 * It handles asset loading, PIXI object creation, and the main render loop.
 */

import { useEffect, useMemo, useState, useRef } from 'react';
import * as L from 'leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import { Track } from '../utils/trackGenerator';
import Stats from 'stats.js';
import { getArrowTexture } from '../lib/pixiAssets';

/**
 * Defines the structure for all PIXI objects associated with a single track.
 */
interface TrackVisuals {
  container: PIXI.Container;
  line: PIXI.Graphics;
  icon: PIXI.Sprite;
  labelContainer: PIXI.Container;
}

/**
 * The core custom hook for managing the Leaflet.PixiOverlay.
 * @param {L.Map | null} map - The Leaflet map instance.
 * @param {Track[]} tracks - An array of track data to be rendered.
 * @param {Stats | null} stats - The stats.js instance for performance monitoring.
 */
export const usePixiOverlay = (map: L.Map | null, tracks: Track[], stats: Stats | null) => {
  const [iconTexture, setIconTexture] = useState<PIXI.Texture | null>(null);
  const pixiOverlayRef = useRef<any>(null);

  /**
   * Effect to fetch the pre-loaded icon texture once the component mounts.
   */
  useEffect(() => {
    getArrowTexture().then(setIconTexture);
  }, []);

  /**
   * Memoizes the creation of PIXI visual objects.
   * This expensive operation runs only when the number of tracks or the icon texture changes.
   */
  const trackVisuals = useMemo(() => {
    if (!iconTexture) return null;

    const visualsMap = new Map<string, TrackVisuals>();
    tracks.forEach(track => {
      const container = new PIXI.Container();
      const line = new PIXI.Graphics();
      const icon = new PIXI.Sprite(iconTexture);
      
      const labelContainer = new PIXI.Container();
      const labelBackground = new PIXI.Graphics();
      const labelText = new PIXI.Text(track.label, {
        fontSize: 12,
        fill: 0xffffff,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });

      const padding = 4;
      const tailSize = 5;
      const cornerRadius = 8;
      const bgColor = 0x2c3e50;

      labelText.position.set(tailSize + padding, padding);

      const bgWidth = labelText.width + (padding * 2) + tailSize;
      const bgHeight = labelText.height + (padding * 2);

      labelBackground.beginFill(bgColor, 0.85);
      labelBackground.moveTo(0, bgHeight / 2);
      labelBackground.lineTo(tailSize, bgHeight / 2 - tailSize);
      labelBackground.lineTo(tailSize, bgHeight / 2 + tailSize);
      labelBackground.drawRoundedRect(tailSize, 0, bgWidth - tailSize, bgHeight, cornerRadius);
      labelBackground.endFill();

      labelContainer.addChild(labelBackground, labelText);
      labelContainer.pivot.set(0, bgHeight / 2);

      icon.anchor.set(0.5, 0.5);
      
      container.addChild(line, icon, labelContainer);
      visualsMap.set(track.id, { container, line, icon, labelContainer });
    });
    return visualsMap;
  }, [tracks, iconTexture]);

  /**
   * The main effect for setting up the overlay and the continuous render loop.
   */
  useEffect(() => {
    if (!map || !stats || !trackVisuals) return;

    const pixiContainer = new PIXI.Container();
    trackVisuals.forEach(visual => pixiContainer.addChild(visual.container));

    const pixiOverlay = (L as any).pixiOverlay((utils: any) => {
      utils.getRenderer().render(utils.getContainer());
    }, pixiContainer);

    pixiOverlay.addTo(map);
    pixiOverlayRef.current = pixiOverlay;

    const ticker = PIXI.Ticker.shared;
    const renderLoop = () => {
      stats.begin();

      const overlay = pixiOverlayRef.current;
      if (overlay) {
        const utils = overlay.utils;
        const project = utils.latLngToLayerPoint;
        const scale = utils.getScale();
        const zoom = utils.getMap().getZoom();

        const thresholdZoom = 15;
        const shrinkFactor = 0.85;
        let zoomModifier = 1.0;
        if (zoom < thresholdZoom) {
          zoomModifier = Math.pow(shrinkFactor, thresholdZoom - zoom);
        }

        const baseScale = 1 / scale;
        const finalScale = baseScale * zoomModifier;
        const isLabelVisible = zoom > 12;

        tracks.forEach(track => {
          const visuals = trackVisuals.get(track.id);
          if (!visuals || track.path.length < 2) return;

          const projectedPath = track.path.map((coords: [number, number]) => project(L.latLng(coords[0], coords[1])));
          
          visuals.line.clear();
          visuals.line.lineStyle(2 / scale, 0x3388ff, 1);
          projectedPath.forEach((point, index) => {
            if (index === 0) visuals.line.moveTo(point.x, point.y);
            else visuals.line.lineTo(point.x, point.y);
          });

          const headPoint = projectedPath[projectedPath.length - 1];
          visuals.icon.position.set(headPoint.x, headPoint.y);
          
          visuals.labelContainer.position.set(headPoint.x + 30 * baseScale, headPoint.y);
          visuals.labelContainer.scale.set(finalScale);
          visuals.labelContainer.visible = isLabelVisible;

          visuals.icon.scale.set(finalScale);

          const prevPoint = projectedPath[projectedPath.length - 2];
          const angle = Math.atan2(headPoint.y - prevPoint.y, headPoint.x - prevPoint.x);
          visuals.icon.rotation = angle;
        });
        
        overlay.redraw();
      }

      stats.end();
    };
    ticker.add(renderLoop);

    return () => {
      ticker.remove(renderLoop);
      if (pixiOverlayRef.current) {
        pixiOverlayRef.current.destroy();
        pixiOverlayRef.current = null;
      }
    };
  }, [map, stats, trackVisuals, tracks]);

  return null;
};